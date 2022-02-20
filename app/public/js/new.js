const form = $("#new-form");
const modal = $("#modal");
const modalContent = $(".modal-content");
const modalText = $("#modal-text");
const modalClose = $("#modal-close");
const dateField = $("#date-field");
let formData;

const createNew = () => {
    modalText.empty();
    $.ajax({
        type: "POST",
        url: "/api/auth/new/create",
        dataType: "json",
        data: formData
    }).done(res => {
        const { profileId, entryId } = res;
        if (profileId && entryId) {
            modalText.append(`
            <div class="center">
                <p>Successfully created a new profile.</p>
                <a href="/view?clientId=${profileId}&entryIds=[${entryId}]">View entry</a>
                <br>
                <a href="/profile?id=${profileId}">Go to profile</a>
            </div>
            `);
        }
    }).fail(res => {
        modalText.empty();
        modalText.append(`<p class="center">Failed to create a new user.</p>`)
        console.error(res);
    })
};

// fill date input with today by default
let [month, day, year] = new Date().toLocaleDateString("en-US").split("/");

if (month.length < 2) month = "0" + month;
if (day.length < 2) day = "0" + day;

dateField.val(year + "-" + month + "-" + day);

form.on("submit", (event) => {
    event.preventDefault();
    formData = form.serialize();

    const first = event.target.f_name.value;
    const middle = event.target.m_name.value;
    const last = event.target.l_name.value;

    fetch(`/api/auth/new/check?f_name=${first}&m_name=${middle}&l_name=${last}`)
        .then(res => res.json())
        .then(data => {
            modalText.empty();
            if (data.conflict) {
                const personName = `${data.first} ${data.middle} ${data.last}`;
                modalText.append(`
                    <div class="center">
                        <p>There are existing entries for someone with the name "${personName}". You may want to check that this is not the same person. Profile will open in a new tab so your entry will not be erased.</p>
                        <a href="/profile?id=${data.id}" target="_blank">View ${personName}'s profile</a>
                        <br>
                        <a href="#" onclick='createNew()'>Create a new profile</a>
                    </div>
                `);
            }
            if (data.message) createNew();
        })
        .catch(err => {
            modalText.empty();
            modalText.append(`<p class="center">Something went wrong...</p>`);
        })
        .finally(() => {
            modal.show();
        })
});

modalClose.on("click", () => {
    modal.hide();
});