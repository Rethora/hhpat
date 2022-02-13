let entryId;
let clientId;

const editEntry = () => {
    window.location = `/edit?profileId=${clientId}&entryId=${entryId}`;
};

const deleteEntry = () => {
    const confirmation = confirm(`Are you sure you want to delete this entry? This action cannot be undone!`);
    if (!confirmation) return;
    fetch(`/api/auth/delete/entry?profileId=${clientId}&entryId=${entryId}`)
        .then(res => {
            if (res.status !== 200) {
                alert("Could not delete entry.");
            }
            return res.json();
        })
        .then(data => {
            if (data.success) window.location = `/profile?id=${clientId}`;
        })
        .catch(err => console.error(err));
};

const openProfile = () => {
    window.location = `/profile?id=${clientId}`;
};

window.addEventListener("load", () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);
    clientId = params.get("clientId");
    entryId = params.get('entryId');
    const spinner = $("#loader");
    const container = $(".container");
    const content = $("#container-content");

    fetch(`/api/auth/get/entry?clientId=${clientId}&entryId=${entryId}`)
        .then(res => {
            if (res.status !== 200) content.append("<p class='center'>Entry not found...</p>");
            return res.json();
        })
        .then(data => {
            const { entry } = data;
            if (entry) {
                const { _id, date, profileName, profileId, ...rest } = entry;
                const dateArr = date.split("T")[0];
                const [year, month, day] = dateArr.split("-");
                content.append(`
                    <div id="head">
                        <h2 id="name">${profileName}</h2>
                        <button onclick="openProfile()" id="profile-btn">Profile<i class="fa fa-user" aria-hidden="true"></i></button>
                    </div>     
                `);
                content.append(`
                    <div class="value">Date: ${month}/${day}/${year}</div>
                    <div class="value">Weight: ${rest.weight || "N/A"}</div>
                    <div class="value">Body Fat %: ${rest.fat || "N/A"}</div>
                    <div class="value">Lean Muscle: ${rest.muscle || "N/A"}</div>
                    <div class="value">Blood Glucose: ${rest.bld_glu || "N/A"}</div>
                    <div class="value">Blood Pressure: ${rest.bld_pres || "N/A"}</div>
                    <div class="value">Cholesterol: ${rest.chol || "N/A"}</div>
                    <div class="value">Resting Metabolic Rate: ${rest.rmr || "N/A"}</div>
                    <div class="value">VO<sub>2</sub> Max: ${rest.vo2 || "N/A"}</div>
                    <div class="value">Low-Density Lipoprotein: ${rest.ldl || "N/A"}</div>
                    <div class="value">High-Density Lipoprotein: ${rest.hdl || "N/A"}</div>
                    <div class="value">Triglycerides: ${rest.trig || "N/A"}</div>
                    <div class="value">Sleep Score: ${rest.sleep || "N/A"}</div>
                    <div class="value">Stress Score: ${rest.stress || "N/A"}</div>
                `);
                if (rest.notes) {
                    content.append(`
                        <div class="value">Notes: ${rest.notes}</div>
                    `);
                }
                content.append(`
                    <div class='btn-group'>
                        <button onclick='editEntry()' class='button'>Edit<i class="fa fa-pencil" aria-hidden="true"></i></button>
                        <button onclick='deleteEntry()' class='button delete'>Delete<i class="fa fa-trash" aria-hidden="true"></i></button>
                    </div>
                `);
            }
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            spinner.hide();
            container.show();
        })
});