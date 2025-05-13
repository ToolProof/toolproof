from shared.src.gcs_utils import download_from_gcs, upload_to_gcs
import subprocess
import os
from datetime import datetime
from google.auth import default
import shutil


def clear_tmp():
    tmp_dir = "/tmp"
    for filename in os.listdir(tmp_dir):
        file_path = os.path.join(tmp_dir, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f"Failed to delete {file_path}: {e}")


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


def prepare_ligand(ligand):
    print("Preparing ligand...")
    output_path = "/tmp/ligand_protomers"
    ligand_with_protomers = add_protomers(ligand)
    run_command(f"micromamba run -n ad_env mk_prepare_ligand.py -i {ligand_with_protomers} --multimol_outdir {output_path}")
    return f"{output_path}/_i0.pdbqt" # ATTENTION: hack since output_path is a directory


def add_protomers(ligand):
    output_path = "/tmp/ligand_with_protomers.sdf"
    
    # Read the SMILES string from the file
    try:
        with open(ligand, "r", encoding="utf-8") as file:
            smiles_string = file.read().strip()
    except Exception as e:
        raise RuntimeError(f"Failed to read SMILES file {ligand}: {e}")

    # Run the command with the SMILES string
    run_command(f'micromamba run -n ad_env scrub.py "{smiles_string}" -o {output_path} --skip_tautomers --ph_low 5 --ph_high 9')
    
    return output_path


def prepare_receptor(receptor, box):
    print("Preparing receptor...")
    intermediate_path = "/tmp/receptor_prepared"
    output_path = f"{intermediate_path}.pdbqt" # ATTENTION

    # Step 1: Extract receptor atoms
    receptor_atoms = extract_receptor_atoms(receptor)
    
    # Step 2: Combine CRYST1 and receptor atoms
    receptor_cryst1 = extract_and_combine_cryst1(receptor, receptor_atoms)
    print(f"CRYST1 combined: saved to {receptor_cryst1}")

    # Step 3: Add hydrogens and optimize
    receptor_cryst1FH = add_hydrogens_and_optimize(receptor_cryst1)
    print(f"Hydrogens added and optimized: saved to {receptor_cryst1FH}")

    # Step 4: Prepare receptor for docking
    run_command(f"micromamba run -n ad_env mk_prepare_receptor.py --read_pdb {receptor_cryst1FH} -o {intermediate_path} -p -v --box_enveloping {box} --padding 5")
    print("Receptor preparation complete.")
    return output_path


def extract_receptor_atoms(receptor):
    output_path = "/tmp/receptor_atoms.pdb"
    run_command(f"""micromamba run -n ad_env python3 - <<EOF
from prody import parsePDB, writePDB
pdb_token = '{receptor}'
atoms_from_pdb = parsePDB(pdb_token)
receptor_selection = "chain A and not water and not hetero"
receptor_atoms = atoms_from_pdb.select(receptor_selection)
writePDB("{output_path}", receptor_atoms)
EOF
""")
    print(f"Receptor atoms extracted: saved to {output_path}")
    return output_path
    

def extract_and_combine_cryst1(receptor, receptor_atoms):
    print("Extracting CRYST1 and combining with receptor atoms...")
    output_path = "/tmp/receptor_cryst1.pdb"
    cryst1_line = run_command(f"grep 'CRYST1' {receptor}", check=False).stdout.strip()
    with open(receptor_atoms, "r", encoding="utf-8") as receptor_f, open(output_path, "w", encoding="utf-8") as combined_f:
        if cryst1_line:
            combined_f.write(cryst1_line + "\n")
        combined_f.writelines(receptor_f.readlines())
    print("Combined receptor file created: {output_path}")
    return output_path


def add_hydrogens_and_optimize(receptor_cryst1):
    print("Adding hydrogens and optimizing with reduce2.py...")
    output_path = "/tmp/receptor_cryst1FH.pdb" # ATTENTION
    # Find the path to the reduce2.py script within the micromamba environment (ad_env)
    micromamba_path = "/opt/conda/envs/ad_env/lib/python3.9/site-packages"
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
        f"micromamba run -n ad_env python3 {reduce2_path} {receptor_cryst1} {reduce_opts}", 
        env=env
    )
    
    # Change the working directory back to the original one
    os.chdir(current_dir)
    
    print("Hydrogens added and optimized. Output: {output_path}")
    
    return output_path


def run_docking(ligand_prepared, receptor_prepared):
    print("Running docking...")
    output_path = "/tmp/docking.pdbqt"
    config_txt = "/tmp/receptor_prepared.box.txt" # ATTENTION
    run_command(f"micromamba run -n ad_env vina --ligand {ligand_prepared} --receptor {receptor_prepared} --config {config_txt} --out {output_path}")
    return output_path


def export_pose(docking):
    print("Exporting docked pose...")
    output_path = "/tmp/pose.sdf"
    run_command(f"micromamba run -n ad_env mk_export.py {docking} -s {output_path}")
    return output_path


def retrieve_gcs_files(**kwargs):
    """
    Retrieves files from Cloud Storage and stores them in /tmp.
    Returns a dictionary with keys and their corresponding local file paths.
    """
    local_files = {}
    
    for key, gcs_path in kwargs.items():
        local_files[key] = download_from_gcs(gcs_path)
            
    
    return local_files


def run_simulation(ligand, receptor, box):
    try:
        clear_tmp()  # Clear temp files before running
        
        # Download necessary files from Cloud Storage
        local_files = retrieve_gcs_files(
            ligand=ligand,
            receptor=receptor,
            box=box
        )

        # Extract local paths for function calls
        ligand_local = local_files["ligand"]
        receptor_local = local_files["receptor"]
        box_local = local_files["box"]
        
        ligand_prepared = prepare_ligand(ligand_local)
        
        receptor_prepared = prepare_receptor(receptor_local, box_local)
        
        docking = run_docking(ligand_prepared, receptor_prepared)
        
        pose = export_pose(docking) 
        
        foldername = os.path.dirname(ligand)
        
        # Upload files to GCS
        
        files_to_upload = [
            (docking, os.path.basename(docking)),
            (pose, os.path.basename(pose)),
        ]
        
        success_files = []
        failed_files = []

        # Upload files to GCS
        for local_path, filename in files_to_upload:
            if os.path.exists(local_path):
                if upload_to_gcs(local_path, foldername, filename):
                    success_files.append(filename)
                else:
                    failed_files.append(filename)
            else:
                print(f"File not found: {local_path}")
                failed_files.append(filename)
        
        print("Upload summary:")
        print(f"Successfully uploaded: {success_files}")
        print(f"Failed uploads: {failed_files}")

        if failed_files:
            return {"status": "partial_success", "uploaded_files": success_files, "failed_files": failed_files}
        return {"status": "success", "uploaded_files": success_files, "foldername": foldername, "filename_docking": os.path.basename(docking), "filename_pose": os.path.basename(pose)} 
    except Exception as e:
        raise RuntimeError(f"Workflow failed: {e}")