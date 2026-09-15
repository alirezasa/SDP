jQuery.extend($login, {
    loadOAuthSection: function() {
        var oAuthDiv = jQuery("#oauth-div");
        var oAuthFrontSection = oAuthDiv.find("#oauth-front-section div");
        var oAuthBackSection = oAuthDiv.find("#oauth-back-section");
        var oAuthBackContainer = oAuthDiv.find("#oauth-back-container");
        if (oAuthDiv.length) {
            jQuery.ajax({
                url: '/servlet/SDOAuthRequestServlet?mode=list',        // No I18N
                async: false,
                type: 'GET',//No I18N
                success: function(response) {
                    if(response.length == 1 && $login.oauthAutoRedirect) {
                        window.location.href = $login.aliasUrl + '/servlet/SDOAuthRequestServlet?mode=login&id=' + response[0].id;
                    }

                    if(response.length > 0) {
                        oAuthFrontSection.parent().removeClass("hide");
                    } else {
                        return;
                    }

                    var maxWidth = oAuthFrontSection[0].offsetWidth;
                    var itemWidth = 40 + 10; // Item width + gap
                    var maxVisible = Math.floor(maxWidth / itemWidth) - 1;

                    for (var key=0; key < response.length; key++) {
                        var icon = response[key].icon_path;
                        icon = icon ? icon : "/images/no-image-icon.svg";        // No I18N
                        var no_image = "/images/no-image-icon.svg" == icon;     // No I18N
                        var id = response[key].id;
                        var name = response[key].provider_name;
                        if(key < maxVisible) {
                            var html = "<button type='button' class='btn btn-default' data-id='" + id + "' title='" + encodeHTMLAttribute(name) + "'>" +       // No I18N
                                            "<img src='" + icon + "' alt='" + encodeHTMLAttribute(name) + "'" + (no_image ? " class='w-32px'" : "") + ">" +
                                       "</button>";
                            oAuthFrontSection.append(html);
                        }
                        var html2 = "<div><button type='button' class='oauthbtn oa-google' data-id='" + id + "' title='" + encodeHTMLAttribute(name) + "'>" +        // No I18N
                                        "<img src='" + icon + "' alt='" + encodeHTMLAttribute(translate('sso.signinwith',[name])) + "'>" +
                                        "<span>" + encodeHTML(translate('sso.signinwith',[name])) + "</span>"        // No I18N
                                   "</button></div>";
                        oAuthBackContainer.append(html2);
                    }
                    oAuthDiv.find("[data-id]").on("click", function() {
                        var obj = jQuery(this);
                        var id = obj.data("id");        // No I18N
                        window.location.href = $login.aliasUrl + '/servlet/SDOAuthRequestServlet?mode=login&id=' + id;
                    });

                    if(response.length > maxVisible) {
                        var front_more = "<button type='button' class='btn btn-default' id='oauth-more' title='" + translate('sdp.common.more') + "'>" +        // No I18N
                                        "<img src='/custom/login/oauthicons/more.svg' alt='" + translate('sdp.common.more') + "'>" +
                                   "</button>";
                        oAuthFrontSection.append(front_more);
                    }

                    var mainSections = jQuery("#oauth-front-section, #login-form, #saml-div, .saml-blk");
                    oAuthFrontSection.find("#oauth-more").on("click", function() {
                        mainSections.addClass("hide");
                        oAuthBackSection.removeClass("hide");
                    });
                    oAuthBackSection.find("#oauth-back").on("click", function() {
                        mainSections.removeClass("hide");
                        oAuthBackSection.addClass("hide");
                    });
                }
            });
        }
    }
});