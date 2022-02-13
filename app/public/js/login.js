const loginForm = $("#login-form");

loginForm.on("submit", (event) => {
    event.preventDefault();
    $.ajax({
        type: "POST",
        url: "/api/auth/login",
        dataType: "json",
        data: loginForm.serialize(),
    }).done(res => {
        if (res.success) window.location.replace("/dashboard");
    }).fail(res => {
        const errorMessage = $(".error-message");
        errorMessage.text(res.responseJSON.message);
    })
})