from flask import Flask, jsonify, request
from tools.autodock import basic_docking
from ai import ai

app = Flask(__name__)

@app.route("/ai", methods=["GET", "POST"])
def handle_request_ai():
    result = ai.start()
    return jsonify({"message": "AI is working!", "result": result})
    

@app.route("/adv", methods=["GET", "POST"])
def handle_request_adv():
    if request.method == "POST":
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        try:
            # Extract arguments from JSON payload
            lig_name = data.get("lig_name")
            lig_smiles_path = data.get("lig_smiles_path")
            lig_box_path = data.get("lig_box_path")
            rec_name = data.get("rec_name")
            rec_no_lig_path = data.get("rec_no_lig_path")

            # Call the workflow from basic_docking
            result = basic_docking.run_simulation(lig_name, lig_smiles_path, lig_box_path, rec_name, rec_no_lig_path)
            return jsonify({"message": "Automation completed successfully", "result": result}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Welcome to my Flask app running on Cloud Run!"})


if __name__ == "__main__":
    # Expose the app on port 8080
    app.run(host="0.0.0.0", port=8080, debug=True)