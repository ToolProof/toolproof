import subprocess
import os
from datetime import datetime
from google.cloud import storage
from google.auth import default


# Set credentials
if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    # Use explicit credentials if provided
    print(f"Using credentials from GOOGLE_APPLICATION_CREDENTIALS: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
elif os.getenv("K_SERVICE"):
    # Running in a Cloud Run environment, ADC is used automatically
    print("Using Application Default Credentials (ADC).")
else:
    raise RuntimeError("No Google Cloud credentials found. Set GOOGLE_APPLICATION_CREDENTIALS.")

# Initialize storage client
storage_client = storage.Client()


def run_command(command, check=True, env=None):
    """Runs a shell command and optionally checks for errors."""
    try:
        result = subprocess.run(command, shell=True, check=check, text=True, capture_output=True, env=env)
        print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error while running command: {command}")
        print(f"Stderr: {e.stderr}")  # More detailed error output
        raise


def prepare_ligand(lig_smiles):
    print("Preparing ligand...")
    output_path = "/tmp/lig_protomers"
    lig_with_protomers = add_protomers(lig_smiles)
    run_command(f"micromamba run -n bd_env mk_prepare_ligand.py -i {lig_with_protomers} --multimol_outdir {output_path}")
    return f"{output_path}/_i0.pdbqt" # ATTENTION: hack since output_path is a directory


def add_protomers(lig_smiles):
    output_path = "/tmp/lig_with_protomers.sdf"
    run_command(f'micromamba run -n bd_env scrub.py "{lig_smiles}" -o {output_path} --skip_tautomers --ph_low 5 --ph_high 9')
    return output_path


def prepare_receptor(rec_raw):
    print("Preparing receptor...")
    intermediate_path = "/tmp/rec_prepared"
    output_path = f"{intermediate_path}.pdbqt" # ATTENTION
    
    # Step 1: Remove ligand from complex
    rec_pure = remove_ligand_from_complex(rec_raw)

    # Step 2: Extract receptor atoms
    rec_atoms = extract_receptor_atoms(rec_pure)
    
    # Step 3: Combine CRYST1 and receptor atoms
    rec_cryst1 = extract_and_combine_cryst1(rec_pure, rec_atoms)
    print(f"CRYST1 combined: saved to {rec_cryst1}")

    # Step 4: Add hydrogens and optimize
    rec_cryst1FH = add_hydrogens_and_optimize(rec_cryst1)
    print(f"Hydrogens added and optimized: saved to {rec_cryst1FH}")

    # Step 5: Prepare receptor for docking
    lig_box = "Meeko/example/tutorial1/input_files/xray-imatinib.pdb" # ATTENTION
    run_command(f"micromamba run -n bd_env mk_prepare_receptor.py --read_pdb {rec_cryst1FH} -o {intermediate_path} -p -v --box_enveloping {lig_box} --padding 5")
    print("Receptor preparation complete.")
    return output_path


def remove_ligand_from_complex(rec_raw):
    
    output_path = "/tmp/rec_pure.pdb"
    
    pymol_command = f"""
    micromamba run -n bd_env pymol -qc -d "
    load {rec_raw};
    remove resn STI;
    save {output_path};
    quit
    "
    """
    run_command(pymol_command)
    print(f"Ligand removed: saved to {output_path}")
    return output_path


def extract_receptor_atoms(rec_pure):
    output_path = "/tmp/rec_atoms.pdb"
    run_command(f"""micromamba run -n bd_env python3 - <<EOF
from prody import parsePDB, writePDB
pdb_token = '{rec_pure}'
atoms_from_pdb = parsePDB(pdb_token)
receptor_selection = "chain A and not water and not hetero"
receptor_atoms = atoms_from_pdb.select(receptor_selection)
writePDB("{output_path}", receptor_atoms)
EOF
""")
    print(f"Receptor atoms extracted: saved to {output_path}")
    return output_path
    

def extract_and_combine_cryst1(rec_pure, rec_atoms):
    print("Extracting CRYST1 and combining with receptor atoms...")
    output_path = "/tmp/rec_cryst1.pdb"
    cryst1_line = run_command(f"grep 'CRYST1' {rec_pure}", check=False).stdout.strip()
    with open(rec_atoms, "r", encoding="utf-8") as receptor_f, open(output_path, "w", encoding="utf-8") as combined_f:
        if cryst1_line:
            combined_f.write(cryst1_line + "\n")
        combined_f.writelines(receptor_f.readlines())
    print("Combined receptor file created: {output_path}")
    return output_path


def add_hydrogens_and_optimize(rec_cryst1):
    print("Adding hydrogens and optimizing with reduce2.py...")
    output_path = "/tmp/rec_cryst1FH.pdb" # ATTENTION
    # Find the path to the reduce2.py script within the micromamba environment (bd_env)
    micromamba_path = "/opt/conda/envs/bd_env/lib/python3.9/site-packages"
    reduce2_path = os.path.join(micromamba_path, "mmtbx", "command_line", "reduce2.py")
    reduce_opts = "approach=add add_flip_movers=True"

    # Set up the geostd path
    geostd_path = os.path.abspath("geostd")
    env = os.environ.copy()
    env["MMTBX_CCP4_MONOMER_LIB"] = geostd_path
    
    # Save the current working directory to return to it later
    current_dir = os.getcwd()
    
    # Change the working directory to /tmp/
    os.chdir("/tmp/")

    # Run reduce2.py within the micromamba environment
    run_command(
        f"micromamba run -n bd_env python3 {reduce2_path} {rec_cryst1} {reduce_opts}", 
        env=env
    )
    
    # Change the working directory back to the original one
    os.chdir(current_dir)
    
    print("Hydrogens added and optimized. Output: {output_path}")
    
    return output_path


def run_docking(lig_prepared, rec_prepared):
    print("Running docking...")
    output_path = "/tmp/lig_docking.pdbqt"
    config_txt = "/tmp/rec_prepared.box.txt" # ATTENTION
    run_command(f"micromamba run -n bd_env vina --ligand {lig_prepared} --receptor {rec_prepared} --config {config_txt} --out {output_path}")
    return output_path


def export_pose(lig_docking):
    print("Exporting docked pose...")
    output_path = "/tmp/lig_pose.sdf"
    run_command(f"micromamba run -n bd_env mk_export.py {lig_docking} -s {output_path}")
    return output_path


def upload_to_gcs(local_path, bucket_name, destination_blob_name):
    """Uploads a file to Google Cloud Storage."""
    try:
        print(f"Uploading {local_path} to GCS bucket {bucket_name} as {destination_blob_name}...")
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_path)
        print(f"File {local_path} uploaded to {bucket_name}/{destination_blob_name}.")
        return True
    except Exception as e:
        print(f"Failed to upload {local_path} to GCS: {e}")
        return False


def run_automation(rec_raw):
    try:
        lig_name = "imatinib"
        lig_smiles = "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5"
        
        lig_prepared = prepare_ligand(lig_smiles)
        
        print(f"Prepared ligand: {lig_prepared}")
        
        rec_prepared = prepare_receptor(rec_raw)
        
        lig_docking = run_docking(lig_prepared, rec_prepared)
        
        lig_pose = export_pose(lig_docking) 
        
        # Get the current date and time
        now = datetime.now()
        # Format the date and time as a string
        date_time_str = now.strftime("%Y-%m-%d %H:%M:%S")
        
        # Ensure the directory exists
        os.makedirs(date_time_str, exist_ok=True)
        
        files_to_upload = [
            (lig_docking, f"{date_time_str}{lig_docking[4:]}"),
            (lig_pose, f"{date_time_str}{lig_pose[4:]}")
        ]
        
        success_files = []
        failed_files = []

        bucket_name = "ligand"

        # Upload files to GCS
        for local_path, blob_name in files_to_upload:
            if os.path.exists(local_path):
                if upload_to_gcs(local_path, bucket_name, blob_name):
                    success_files.append(blob_name)
                else:
                    failed_files.append(blob_name)
            else:
                print(f"File not found: {local_path}")
                failed_files.append(blob_name)
        
        print("Upload summary:")
        print(f"Successfully uploaded: {success_files}")
        print(f"Failed uploads: {failed_files}")

        if failed_files:
            return {"status": "partial_success", "uploaded_files": success_files, "failed_files": failed_files}
        return {"status": "success", "uploaded_files": success_files} 
    except Exception as e:
        raise RuntimeError(f"Workflow failed: {e}") from e