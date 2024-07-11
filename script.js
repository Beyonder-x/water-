document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = parseFloat(value);
    });

    // Convert data to the required payload format
    const payload = JSON.stringify({
        "input_data": [
            {
                "fields": Object.keys(data),
                "values": [Object.values(data)]
            }
        ]
    });

    // Get token and make API request
    getToken((err) => console.error(err), function() {
        let tokenResponse;
        try {
            tokenResponse = JSON.parse(this.responseText);
        } catch (ex) {
            console.error("Error parsing token response", ex);
            return;
        }

        const scoring_url = "https://us-south.ml.cloud.ibm.com/ml/v4/deployments/39c164f3-2e82-4813-9b86-bf6fbcd5b204/predictions?version=2021-05-01";
        apiPost(scoring_url, tokenResponse.access_token, payload, function(resp) {
            let parsedPostResponse;
            try {
                parsedPostResponse = JSON.parse(this.responseText);
            } catch (ex) {
                console.error("Error parsing scoring response", ex);
                return;
            }
            document.getElementById('resultOutput').textContent = JSON.stringify(parsedPostResponse.predictions[0].values, null, 2);
        }, function(error) {
            console.error("API error:", error);
        });
    });
});

function getToken(errorCallback, loadCallback) {
    const req = new XMLHttpRequest();
    req.addEventListener("load", loadCallback);
    req.addEventListener("error", errorCallback);
    req.open("POST", "https://iam.cloud.ibm.com/identity/token");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Accept", "application/json");
    req.send("grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=CSxU9FUZSfeTvkaqlEVaLgVi-6qH2hrc-hMIyWEAURPp");
}

function apiPost(scoring_url, token, payload, loadCallback, errorCallback) {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", loadCallback);
    oReq.addEventListener("error", errorCallback);
    oReq.open("POST", scoring_url);
    oReq.setRequestHeader("Accept", "application/json");
    oReq.setRequestHeader("Authorization", "Bearer " + token);
    oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    oReq.send(payload);
}
