const queryString = window.location.search;
const parameters = new URLSearchParams(queryString);
const profileId = parameters.get('id');
const content = $(".content");
let userName;
let selectedEntries = [];

const graphsToMake = [
    "weight",
    "bld_pres",
    "rmr",
    "fat",
    "muscle",
    "chol",
    "ldl",
    "hdl",
    "trig",
    "bld_glu",
    "vo2",
    "sleep",
    "stress"
];

let margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 850 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// listeners
const printAllPages = () => {
    let tabs = document.getElementsByClassName("tabcontent");
    let printWindow = window.open('', 'PRINT');
    for (let i = 0; i < tabs.length; i++) {
        let tab = tabs[i];
        if (tab.id !== "overview") {
            printWindow.document.write(`<div class="graph">${tab.innerHTML}</div>`);
        }
    }
    const printHead = printWindow.document.getElementsByTagName("head")[0];
    const cssLink = printWindow.document.createElement("link");
    cssLink.type = "text/css";
    cssLink.rel = "stylesheet";
    cssLink.href = "../css/print.css";
    printHead.appendChild(cssLink);
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 1000);
};

const addEntry = () => {
    // link to new entry page by id
    window.location = `/add?id=${profileId}`;
};

const deleteUser = () => {
    // window confirm for deletion and route to delete user
    const confirmation = confirm(`Are you sure you want to delete profile for "${userName}"? This action cannot be undone!`);
    if (!confirmation) return;
    fetch(`/api/auth/delete/profile?profileId=${profileId}`)
        .then(res => {
            if (res.status !== 200) {
                return alert("Something went wrong while trying to delete the profile.");
            }
            window.location = "/profiles";
        })
        .catch(err => console.error(err));
};

const openView = () => {
    let sIds = '';
    selectedEntries.forEach((id, i) => {
        sIds += id
        if (i !== selectedEntries.length - 1) sIds += ","
    })
    window.location = `/view?clientId=${profileId}&entryIds=[${sIds}]`;
}

const openViewNewTab = (entryId) => {
    window.open(`/view?clientId=${profileId}&entryIds=[${entryId}]`, "_blank");
};

$("#open-entries").on("submit", (e) => {
    e.preventDefault();
    openView()
})

// draw components
const makeOverview = (values, userId) => {
    if (!values.length) return $("#entries").append("<p class='center'>No entries yet...</p>")
    values.forEach(value => {
        const dateArr = value.date.split("T");
        const [year, month, day] = dateArr[0].split("-");
        $("#entries").append(`
            <input class="entry" value="false" type="checkbox" data-id=${value._id}>
            <label>${month}/${day}/${year}</label>
            <br>
        `);

    })

    // controlling selection of entries and displaying open button if at least one selected
    $(".entry").on("click", (e) => {
        if (e.target.value === "false") {
            e.target.value = "true"
        } else {
            e.target.value = "false"
        }
        const entryId = e.target.getAttribute("data-id")
        const selectedIdx = selectedEntries.findIndex(elem => elem === entryId)
        if (selectedIdx !== -1) {
            if (e.target.value === "false") selectedEntries.splice(selectedIdx, 1)
        } else {
            if (e.target.value === "true") selectedEntries.push(entryId)
        }

        if (!selectedEntries.length) {
            $("#open-entries-submit").hide()
        } else {
            $("#open-entries-submit").show()
        }

    })
};

// on page load
window.addEventListener("load", () => {
    fetch(`/api/auth/get/profile?id=${profileId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                $("body").append("<p class='center'>No profile found...</p>");
            } else {
                const { client } = data;
                userName = `${client.f_name} ${client.m_name} ${client.l_name}`;
                $("#name").append(userName);
                makeOverview(client.values, client._id);
                drawAllGraphs(client.values);
                content.show();
            }
        })
        .catch(err => console.error(err))
        .finally(() => {
            $("#loader").hide();
        });
});


// tabs
const openTab = (evt, tabName) => {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
};

// open overview by default
document.getElementById("default").click();

// graphs
const drawYAxis = (data, graph) => {
    const yAxis = d3.scaleLinear()
        .domain([d3.min(data, (d) => d[graph.name] - 20), d3.max(data, (d) => d[graph.name] + 20)])
        .range([height, 0]);
    graph.graph.append("g")
        .call(d3.axisLeft(yAxis).tickSizeOuter(0));
    return yAxis;
};

const drawToolTip = (graph) => {
    const tooltip = d3
        .select(`#${graph.name}-vis`)
        .append("div")
        .attr("class", "tooltip")
    return tooltip;
};

const drawPoints = (graph) => {
    const tooltip = graph.toolTip;
    graph.graph.selectAll("points")
        .data(graph.data)
        .enter()
        .append("circle")
        .attr("class", "hover")
        .attr("fill", "black")
        .attr("stroke", "none")
        .attr("cx", (d) => graph.xAxis(d.date))
        .attr("cy", (d) => graph.yAxis(d[graph.name]))
        .attr("onclick", (d) => `openViewNewTab('${d._id}')`)
        .attr("r", 5)
        .on("mouseover", (event, d) => {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", .9);
            tooltip
                .html(
                    `
                        <div>Date: <strong>${d.date.toLocaleDateString("en-US")}</strong></div>
                        <div>Value: <strong>${d[graph.name]}</strong></div>
                    `
                )
                .style("left", (event.pageX - 320) + "px")
                .style("top", (event.pageY - 140) + "px");
        })
        .on("mouseout", (d) => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

const drawLine = (graph) => {
    graph.graph.append("path")
        .datum(graph.data)
        .attr("fill", "none")
        .attr("stroke", "#76b852")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x((d) => graph.xAxis(d.date))
            .y((d) => graph.yAxis(d[graph.name])))
};

const drawAllGraphs = (data) => {

    const formatTime = d3.timeFormat("%Y-%m-%d");
    const formatDate = d3.timeParse("%Y-%m-%d");

    // format date to be able to use
    data.map(d => {
        const dateArr = d.date.split("T")[0];
        const [year, month, day] = dateArr.split("-");
        const date = new Date(parseInt(year), parseInt(month - 1), parseInt(day));
        const formattedTime = formatTime(date);
        d.date = formatDate(formattedTime);
        return d;
    });

    // sort the data by date
    data.sort((a, b) => a.date - b.date);

    // make graphs where id and data propery have the same name add to array if more values are being stored in the future
    const graphs = graphsToMake.map(name => {

        // remove any entries for category that have null values
        let fixedData = [];
        data.forEach(d => {
            if (!d[name]) return;
            fixedData.push(d);
        });

        // create svg and draw to tabs
        let svg;
        if (fixedData.length) {
            svg = d3.select(`#${name}-vis`)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        } else {
            svg = d3.select(`#${name}-vis`)
                .append('div')
                .html(`
                    <p class='no-data-text'>No data to show here...</p>
                `)
                .attr('class', 'no-data')

        }
        return { graph: svg, name: name, data: fixedData };
    });

    // draw the x-axis for all the graphs
    graphs.forEach(graph => {
        const xAxis = d3.scaleTime().domain(d3.extent(graph.data, (d) => d.date)).range([0, width]);
        graph.graph.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xAxis).tickSizeOuter(0).tickFormat(d3.timeFormat("%m/%d/%y")));
        graph.toolTip = drawToolTip(graph);
        graph.xAxis = xAxis;
        graph.yAxis = drawYAxis(graph.data, graph);
        drawLine(graph);
        drawPoints(graph);
    });
};