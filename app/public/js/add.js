let id;

window.addEventListener("load", () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);
    id = params.get('id');
    let [month, day, year] = new Date().toLocaleDateString("en-US").split("/");
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    
    $("#date-field").val(year + "-" + month + "-" + day);

    fetch(`/api/auth/get/profile?id=${id}`)
    .then(res => {
        if (res.status !== 200) {
            // display error
            const content = $("#new-form");
            content.empty();
            content.append("<p class='center'>ERROR: no profile found!</p>")
        }
        return res.json();
    })
    .then(data => {
        const {client} = data;
        $("h3").append(`<span> for ${client.f_name} ${client.m_name} ${client.l_name}</span>`);
    });
});


$("#new-form").on("submit", (event) => {
    event.preventDefault();
    const formData = $("#new-form").serialize();

    $.ajax({
        type: "POST",
        url: `/api/auth/add?profileId=${id}`,
        dataType: "json",
        data: formData
    }).done(res => {
        if (res.entryId) {
            const modal = $("#modal");
            const modalText = $("#modal-text");
            modalText.empty();
            modalText.append(`
            <div class="center">
                    <p>Successfully added a new entry.</p>
                    <a href="/view?clientId=${id}&entryId=${res.entryId}">View entry</a>
                    <br>
                    <a href="/profile?id=${id}">Go to profile</a>
                </div>
            `);
            modal.show();
        }
    }).fail(res => {
        alert("Something went wrong while trying to add a new entry.")
        console.error(res);
    })
});

$("#modal-close").on("click", (event) => {
    event.preventDefault();
    const modal = $("#modal");
    modal.hide();
});