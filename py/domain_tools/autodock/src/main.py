from flask import Flask, request, jsonify
from autodock import basic_docking, reactive_docking
import os

app = Flask(__name__)
    

@app.route("/autodock_basic", methods=["GET", "POST"])
def autodock_basic():
    if request.method == "POST":
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        try:
            # Extract arguments from JSON payload
            ligand = data.get("ligand") # /tp-resources/imatinib.smi"
            receptor = data.get("receptor") # "tp-resources/1iep.pdb"
            box = data.get("box") # "tp-resources/xray-imatinib.pdb"

            # Call the workflow from basic_docking
            result = basic_docking.run_simulation(ligand, receptor, box)
            return jsonify({"message": "Automation completed successfully", "result": result}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Basic docking endpoint"})


@app.route('/autodock_reactive', methods=["GET", "POST"])
def autodock_reactive():
    if request.method == "POST":
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        data = request.get_json()
        
        try:
            # Extract arguments from JSON payload
            lig_name = data.get("lig_name")
            lig_smiles_path = data.get("lig_smiles_path")
            lig_box_path = data.get("lig_box_path")
            rec_name = data.get("rec_name")
            rec_no_lig_path = data.get("rec_no_lig_path")
            reactive_groups = data.get("reactive_groups", None)
            reactive_residues = data.get("reactive_residues", None)

            # Call the workflow from reactive_docking
            result = reactive_docking.run_simulation(
                lig_name, 
                lig_smiles_path, 
                lig_box_path, 
                rec_name, 
                rec_no_lig_path,
                reactive_groups,
                reactive_residues
            )
            return jsonify({"message": "Reactive docking completed successfully", "result": result}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    return jsonify({"message": "Reactive docking endpoint"})

if __name__ == "__main__":
    # Expose the app on port 8080
    app.run(host="0.0.0.0", port=8080, debug=True)