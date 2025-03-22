from flask import Flask, request, jsonify
from autodock import basic_docking, reactive_docking
import os

app = Flask(__name__)
    

@app.route("/adv", methods=["GET", "POST"])
def handle_request_adv():
    if request.method == "POST":
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        try:
            # Extract arguments from JSON payload
            lig_name = data.get("lig_name") # "imatinib"
            lig_smiles_path = data.get("lig_smiles_path") # /tp-data/resources/imatinib.txt"
            lig_box_path = data.get("lig_box_path") # "tp-data/resources/xray-imatinib.pdb"
            rec_name = data.get("rec_name") # "1iep"
            rec_no_lig_path = data.get("rec_no_lig_path") # "tp-data/resources/1iep_no_lig.pdb"

            # Call the workflow from basic_docking
            result = basic_docking.run_simulation(lig_name, lig_smiles_path, lig_box_path, rec_name, rec_no_lig_path)
            return jsonify({"message": "Automation completed successfully", "result": result}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Welcome to my Flask app running on Cloud Run!"})

@app.route('/reactive', methods=['POST'])
def reactive():
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
        
    return jsonify({"message": "Welcome to my Flask app running on Cloud Run!"})

if __name__ == "__main__":
    # Expose the app on port 8080
    app.run(host="0.0.0.0", port=8080, debug=True)