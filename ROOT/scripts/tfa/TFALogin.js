TFAUserEnrollment.viewName = "";
TFAUserEnrollment.selectedAuth = "";

// Overriding setCurrentView from ME-ONE's TFAEnrollment.js
if (TFAUserEnrollment.setCurrentViewBackup === undefined) {
    TFAUserEnrollment.setCurrentViewBackup = TFAUserEnrollment.setCurrentView;
    TFAUserEnrollment.setCurrentView = function (viewName, selectedAuth) {
        TFAUserEnrollment.viewName = viewName;
        TFAUserEnrollment.selectedAuth = selectedAuth;

        TFAUserEnrollment.setCurrentViewBackup(viewName, selectedAuth);
        onPostSetCurrentView();
    };
}

// Overriding setStatusMessage from ME-ONE's TFAEnrollment.js
if (TFAUserEnrollment.setStatusMessageBackup === undefined) {
    TFAUserEnrollment.setStatusMessageBackup = TFAUserEnrollment.setStatusMessage;
    TFAUserEnrollment.setStatusMessage = function (statusType, message) {
        TFAUserEnrollment.setStatusMessageBackup(statusType, message);
        onPostSetStatusMessage(statusType, message);
    };
}

function setMaskedEmail() {
    jQuery("#VERIFY_AUTH #TFA_MAIL_AUTHENTICATOR span").text(jQuery("#masked_email_msg").text());
}

function showCustomMessageDiv(title, content) {
    var msgDiv = jQuery("#custom_msg_content");
    msgDiv.text(content);
    msgDiv.parent().html(title + msgDiv[0].outerHTML);
    jQuery("#custom_msg_div").show();
}

function onCustomButtonClick() {
    if (TFAUserEnrollment.hasMoreModes) {
        jQuery('#custom_msg_div').hide();
        TFAUserEnrollment.back('SELECT_AUTH');      // No I18N
    } else {
        TFAUserEnrollment.cancel();
    }
}

function onPostSetStatusMessage(statusType, message) {
    if (TFAUserEnrollment.usePrimaryEmail) {
        if (!statusType && "ENROLL_AUTH" === TFAUserEnrollment.viewName && "TFA_MAIL_AUTHENTICATOR" === TFAUserEnrollment.selectedAuth) {
            TFAUserEnrollment.hideStatusMessage();
            showCustomMessageDiv(jQuery("#common_error_title").text(), message);
        }
    }
}

function onPostSetCurrentView() {
    var viewName = TFAUserEnrollment.viewName;
    var selectedAuth = TFAUserEnrollment.selectedAuth;

    if (TFAUserEnrollment.usePrimaryEmail) {
        // TFAUserEnrollment.selectAuth() makes 'getEnrollmentDetails' ajax call.
        // On success, TFAUserEnrollment.setCurrentView() is called and lands here due to the override.
        if ("ENROLL_AUTH" === viewName && "TFA_MAIL_AUTHENTICATOR" === selectedAuth) {
            // SD-98982 | Hiding mail enrollment section to prevent vulnerability during new enrollment.
            jQuery("#ENROLL_AUTH").hide();
            if (TFAUserEnrollment.isEmailEmpty) {
                showCustomMessageDiv(jQuery("#no_email_title").text(), jQuery("#no_email_msg").text());
            } else {
                // The user email (AUTH_SECRET_KEY) will be set in the "enter email" input just after
                // the end of this method (in success response of TFAUserEnrollment.selectAuth()).
                // Hence clicking the button just after it's set (with a small delay) as Network delay doesn't matter.
                setTimeout(function () {
                    jQuery("#ENROLL_AUTH").find(".fw-btn-primary").click();
                }, 50);

                // Changing the currently invisible "Back" button of VERIFY_AUTH section to "Cancel" (assuming
                // mail sending is success) to prevent user from going back to enrollment field.
                // Even if sending fails or any other error occurs, it is handled in onPostSetStatusMessage.
                var backButton = jQuery("#VERIFY_AUTH_OPERATIONS_BTN").find(".fw-btn-default");
                backButton.text(jQuery('#cancel_msg').text());
                backButton.prop("onclick", function () {        // No I18N
                    return TFAUserEnrollment.cancel;
                });
            }
        } else if ("VERIFY_AUTH" === viewName && "TFA_MAIL_AUTHENTICATOR" === selectedAuth) {       // No I18N
            setMaskedEmail();
        }
    }
}
