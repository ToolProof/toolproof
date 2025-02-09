from flask import Flask, jsonify, request
import basic_docking
import micro_flows

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def handle_request():
    if request.method == "POST":
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        try:
            
            rec_raw = "input_files/1iep.pdb"
            
            # Call the workflow from basic_docking
            # result = basic_docking.run_automation(rec_raw)
            result = micro_flows.alpha(rec_raw) # ATTENTION
            return jsonify({"message": "Automation completed successfully", "result": result}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Welcome to my Flask app running on Cloud Run!"})


if __name__ == "__main__":
    # Expose the app on port 8080
    app.run(host="0.0.0.0", port=8080)
