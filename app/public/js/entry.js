let entryIds;
let clientId;

const printPage = () => window.print()

const editEntry = (entryId) => {
    window.location = `/edit?profileId=${clientId}&entryId=${entryId}`;
};

const deleteEntry = (entryId) => {
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

const makeTables = (elem, entries) => {

    const valueMap = {
        weight: { name: "Weight", unit: "lbs" },
        bld_pres: { name: "Blood Pressure", unit: "" },
        rmr: { name: "Resting Metabolic Rate", unit: "cal" },
        fat: { name: "Body Fat", unit: "%" },
        muscle: { name: "Lean Muscle", unit: "lbs" },
        chol: { name: "Cholesterol", unit: "mg/dl" },
        ldl: { name: "Low-Density Lipoprotein", unit: "mg/dl" },
        hdl: { name: "High-Density Lipoprotein", unit: "mg/dl" },
        trig: { name: "Triglycerides", unit: "mg/dl" },
        bld_glu: { name: "Blood Glucose", unit: "mg/dl" },
        vo2: { name: "Vo<sub>2</sub>", unit: "mL/kg/min" },
        sleep: { name: "Sleep Score", unit: "" },
        stress: { name: "Stress Score", unit: "" }
    }

    const dateCellColors = [
        "red",
        "green",
        "blue",
        "yellow",
        "purple",
        "teal",
        "pink",
        "orange"
    ]

    entries.forEach((e, i) => {
        const { _id, date, notes, ...rest } = e
        const dateArr = date.split("T")[0]
        const [year, month, day] = dateArr.split("-")
        elem.append("<table></table>")
        const tableElement = $("table")[i]
        const table = $(tableElement)
        table.append(`
            <tr class=${dateCellColors[i % (dateCellColors.length - 1)]}>
                <td>Date</td>
                <td>${month}/${day}/${year}</td>
            </tr>
        `)
        Object.keys(valueMap)
            .forEach(key => {
                table.append(`
                    <tr>
                        <td>${valueMap[key].name}</td>
                        <td>${rest[key] || "N/A"} ${rest[key] ? valueMap[key].unit : ""}</td>
                    </tr>
                `)
            })
        if (notes.length) {
            table.append(`
                <tr>
                    <td>Notes</td>
                    <td>${notes}</td>
                </tr>
            `)
        }
        table.append(`
            <tr class="edit">
                <td class="left"><i onclick="editEntry('${_id}')" class="fa fa-pencil icon" aria-hidden="true"></i></td>
                <td class="right"><i onclick="deleteEntry('${_id}')" class="fa fa-trash icon" aria-hidden="true"></i></td>
            </tr>
        `)
    })
}

window.addEventListener("load", () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);
    clientId = params.get("clientId");
    entryIds = params.get('entryIds');
    const spinner = $("#loader");
    const container = $(".container");
    const content = $("#container-content");

    fetch(`/api/auth/get/entry?clientId=${clientId}&entryIds=${entryIds}`)
        .then(res => {
            if (res.status !== 200) content.append("<p class='center'>Entry not found...</p>")
            return res.json()
        })
        .then(data => {
            if (data.entries.length) {
                $("#head").append(`
                    <h2 id="name">${data.profileName}</h2>
                    <button onclick="openProfile()" id="profile-btn">Profile<i class="fa fa-user" aria-hidden="true"></i></button>
                `)
                makeTables(content, data.entries)
            }
        })
        .catch(err => console.error(err))
        .finally(() => {
            spinner.hide()
            container.show()
        })
});