let profiles;
let filtered;
const loader = $("#loader");
const container = $(".content");
const profileContainer = $("#profiles");
const table = $("table");
const search = $("#search-form");

const sortArr = (prop) => {
    if (prop === "date") {
        filtered.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
    } else {
        filtered.sort((a, b) => a[prop].localeCompare(b[prop]));
    }
    displayResults(filtered);
};

const displayResults = (arr) => {
    table.empty();
    if (!arr.length) return table.append("<p class='no-results'>No Results...</p>")
    table.append(`
        <tr>
            <th onclick="sortArr('first')">First</th>
            <th onclick="sortArr('middle')">Middle</th>
            <th onclick="sortArr('last')">Last</th>
            <th onclick="sortArr('date')">Last Update</th>
        </tr>
    `);
    arr.forEach(result => {
        const lastUpdate = result.lastUpdate;
        let formattedDate;
        if (!lastUpdate) {
            formattedDate = "N/A";
        } else {
            const date = result.lastUpdate.split("T")[0];
            const [year, month, day] = date.split("-");
            formattedDate = month + "/" + day + "/" + year;

        }
        table.append(
            `
                <tr onclick="openProfile('${result.id}')">
                    <td>${result.first}</td>
                    <td>${result.middle}</td>
                    <td>${result.last}</td>
                    <td>${formattedDate}</td>
                </tr>
            `
        );
    });
};

window.addEventListener("load", () => {
    fetch("/api/auth/profiles")
        .then(res => res.json())
        .then(data => {
            if (!data.profiles.length) {
                container.append("No profiles to show...");
            } else {
                profiles = [...data.profiles];
                filtered = [...data.profiles];
                sortArr('first');
            }
        })
        .catch(err => console.error(err))
        .finally(() => {
            loader.hide();
            container.show()
        });
})


search.on("submit", event => {
    event.preventDefault();
    const filterBy = event.target.select.value;
    const value = event.target.search.value.toLowerCase();
    filtered = profiles.filter(profile => profile[filterBy].includes(value));
    displayResults(filtered);
});

const openProfile = (id) => {
    window.location = `/profile?id=${id}`;
};