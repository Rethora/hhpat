let profileId;
let entryId;
let modal = {};

$("#new-form").on("submit", e => {
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: `/api/auth/entry/edit?profileId=${profileId}&entryId=${entryId}`,
        dataType: "json",
        data: $("#new-form").serialize()
    }).done(res => {
        if (res.success) {
            modal.text.empty();
            modal.text.append(`
                <div class="center">
                <p>Successfully updated entry.</p>
                <a href="/view?clientId=${profileId}&entryIds=[${entryId}]">View entry</a>
                <br>
                <a href="/profile?id=${profileId}">Go to profile</a>
                </div>
            `);
            modal.container.show();
        }
    }).fail(res => {
        console.error(res);
    })
})

window.addEventListener("load", () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);
    profileId = params.get("profileId");
    entryId = params.get('entryId');
    const loader = $("#loader");
    const content = $(".container");
    modal.container = $("#modal");
    modal.text = $("#modal-text");

    fetch(`/api/auth/get/entry?clientId=${profileId}&entryIds=[${entryId}]`)
        .then(res => {
            if (res.status !== 200) {
                $("body").append("<p class='center'>Entry not found...</p>")
            }
            return res.json();
        })
        .then(data => {
            const { entries } = data;
            if (entries.length) {
                const entry = entries[0]
                const { _id, bld_pres, date, notes, ...rest } = entry
                Object.keys(rest).forEach(key => {
                    const input_element = $(`#new-form input[name=${key}]`);
                    if (input_element) {
                        if (entry[key]) {
                            input_element.val(entry[key]);
                        }
                    };
                })
                if (bld_pres && bld_pres.length) {
                    const [sys, dia] = bld_pres.split("/")
                    $("#new-form input[name=sys]").val(sys);
                    $("#new-form input[name=dia]").val(dia);
                }
                if (notes.length) {
                    $("#new-form textarea[name=notes]").val(notes);
                }
                const dateArr = date.split("T")[0];
                const [year, month, day] = dateArr.split("-");
                $("#date-field").val(`${year}-${month}-${day}`);
                content.show();
            }
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            loader.hide();
        })
});

$("#modal-close").on("click", () => {
    modal.container.hide();
});