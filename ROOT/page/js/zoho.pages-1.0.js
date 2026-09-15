function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

window.ZohoPages = function pagebuilder($) {
  'use strict';
  /* eslint no-underscore-dangle: 0 */

  var _config;

  var baseUrl = '/page/v1/'; // No I18N

  var messageResources = {
    scopeId_required: 'scopeId doesnt exist',
    pageId_required: 'pageId doesnt exist',
    fields_required: 'fields doesnt exist',
    target_required: 'target doesnt exist',
    target_not_supported: 'target not supported'
  };
  /* yui compression fix */

  /* eslint quote-props: 0 */

  var interceptParams = {
    /* scopeId is mandatory for all */
    'create': ['serviceName'],
    // csrf
    'edit': ['pageId', 'target'],
    'live': ['pageId', 'target'],
    'pdf': ['pageId'],
    'delete': ['pageId'],
    // csrf
    'duplicate': ['pageId'],
    // csrf
    'list': [],
    'showBuilder': [],
    'showLiveContent': [],
    'showPanelBuilder': [],
    'loadTemplateContent': []
  };

  function intercept(ucallback, callback) {
    var error = {};
    var requiredParams = interceptParams[_config.type];

    if (requiredParams) {
      for (var k = 0; k < requiredParams.length; k += 1) {
        var val = requiredParams[k];

        if (!_config[val]) {
          error.status = 400;
          error.message = messageResources[val + '_required'];
          break;
        }
      }
    }

    if (error.status) {
      ucallback(error);
    } else {
      callback();
    }
  }

  function resultIntercept(result, ucallback, callback) {
    if (result === 'error') {
      result = {
        error: 'error'
      };
    }

    if (result.error) {
      result.type = _config.type;

      if (ucallback) {
        ucallback(result);
      }
    } else {
      callback(result);
    }
  }

  function getUrl() {
    switch (_config.type) {
      case 'create':
        var url = baseUrl + _config.scopeId + '/new?serviceName=' + _config.serviceName; // No I18N

        if (_config.pageName) {
          url += '&displayName=' + _config.pageName;
        }

        if (_config.pageContent) {
          url += '&pageContent=' + _config.pageContent;
        }

        if (_config.templateName) {
          url += '&theme=' + _config.templateName;
        }

        return url;

      case 'edit':
        return baseUrl + _config.scopeId + '/' + _config.pageId + '/edit';
      // No I18N

      case 'live':
        return baseUrl + _config.scopeId + '/' + _config.pageId + '/live';
      // No I18N

      case 'pdf':
        return baseUrl + _config.scopeId + '/' + _config.pageId + '/pdf';
      // No I18N

      case 'delete':
        return baseUrl + _config.scopeId + '/' + _config.pageId + '/delete';
      // No I18N

      case 'duplicate':
        var dUrl = baseUrl + _config.scopeId + '/' + _config.pageId + '/duplicate'; // No I18N

        if (_config.targetScopeId) {
          dUrl += '?targetScopeId=' + _config.targetScopeId;
        }

        return dUrl;

      case 'list':
        return baseUrl + _config.scopeId + '/list';
      // No I18N

      case 'showBuilder':
        return BuilderConstants.jsppath + '/dashboard/dashboardBuilder.jsp';

      case 'showLiveContent':
        return BuilderConstants.jsppath + '/dashboard/live/dashboardLive.jsp';

      case 'showPanelBuilder':
        return BuilderConstants.jsppath + '/dashboard/panelBuilder.jsp';

      default:
        return baseUrl;
    }
  }
  /**
   * @param {any} url
   * @param {any} type
   * @param {any} params
   * @param {any} target
   * @param {any} callback
   */


  function makeRequest(url, type, params, target, callback) {
    if (target === 'new-window' || target === 'same-window') {
      var paramString = '';

      if (params !== null) {
        Object.keys(params).forEach(function (key) {
          paramString += "<input type='text' name = '" + key + "' value = '" + params[key] + "' ></input>";
        });
      }

      var targetStr = target === 'new-window' ? "target='_blank'" : '';
      var form = $('<form ' + targetStr + " method='" + type + "' action='" + url + "' >" + paramString + '</form>');
      $('body:first').append(form);
      $(form).submit().remove();
    } else {
      $.ajax({
        url: url,
        data: params,
        type: type,
        // No I18N
        headers: _objectSpread({}, BuilderConstants.nonce ? {
          nonce: BuilderConstants.nonce
        } : {}),
        success: function success(response) {
          callback(response);
        },
        error: function error(jqXHR) {
          callback({
            code: jqXHR.status,
            message: jqXHR.responseText
          });
        }
      });
    }
  }

  function invokeCallback(callback, response) {
    if (callback) {
      callback(null, response);
    }
  }

  function create(callback) {
    var data = {}; // if (_config.pageName) {
    //   data.displayName = _config.pageName;
    // }
    // if (_config.pageContent) {
    //   data.pageContent = _config.pageContent;
    // }
    // if (_config.serviceName) {
    //   data.serviceName = _config.serviceName;
    // }

    if (_config.csrfParam) {
      var csrfParam = _config.csrfParam.split(':');

      data[csrfParam[0]] = csrfParam[1];
    }

    data = Object.keys(data).length === 0 && data.constructor === Object ? null : data;
    makeRequest(getUrl(), 'POST', data, null, function (response) {
      resultIntercept(response, callback, function () {
        invokeCallback(callback, response);
      });
    });
  }

  function del(callback) {
    var data = {};

    if (_config.csrfParam) {
      var csrfParam = _config.csrfParam.split(':');

      data[csrfParam[0]] = csrfParam[1];
    }

    makeRequest(getUrl(), 'POST', data, null, function (response) {
      resultIntercept(response, callback, function () {
        invokeCallback(callback, response);
      });
    });
  }

  function duplicate(callback) {
    var data = {};

    if (_config.csrfParam) {
      var csrfParam = _config.csrfParam.split(':');

      data[csrfParam[0]] = csrfParam[1];
    }

    makeRequest(getUrl(), 'POST', data, null, function (response) {
      resultIntercept(response, callback, function () {
        invokeCallback(callback, response);
      });
    });
  }

  function edit(callback) {
    makeRequest(getUrl(), 'GET', null, _config.target, function (response) {
      resultIntercept(response, callback, function () {
        if ($(_config.target).length) {
          $(_config.target).empty().html(response);
          $PBDashboard.init(callback);
        }
      });
    });
  }

  function live(callback) {
    makeRequest(getUrl(), 'GET', null, _config.target, function (response) {
      resultIntercept(response, callback, function () {
        $(_config.target).empty().html(response);
        invokeCallback(callback, {
          pageId: _config.pageId
        });
      });
    });
  }

  function list(callback) {
    makeRequest(getUrl(), 'GET', null, null, function (response) {
      resultIntercept(response, callback, function () {
        invokeCallback(callback, response);
      });
    });
  }

  function pdf(callback) {
    var params = {
      fieldsJSON: _config.fields
    };

    if (_config.target !== 'new-window' && _config.target !== 'same-window') {
      callback({
        error: 400,
        status: messageResources.target_not_supported
      });
      return;
    }

    makeRequest(getUrl(), 'GET', params, _config.target);
  }

  function showBuild(callback) {
    makeRequest(getUrl() + '?service=' + BuilderConstants.service + '&csspath=' + BuilderConstants.csspath, 'GET', {}, _config.target, function (response) {
      resultIntercept(response, callback, function () {
        if ($(_config.target).length) {
          $(_config.target).empty().html(response);

          if (BuilderConstants.customHeader) {
            $(_config.target).find('.appbuilder-popup-header-container').html(BuilderConstants.customHeader);
          }

          $PBDashboard.init(callback);
        }
      });
    });
  }

  function showLive(callback) {
    makeRequest(getUrl() + '?service=' + BuilderConstants.service + '&csspath=' + BuilderConstants.csspath + '&jspath=' + BuilderConstants.jspath, 'GET', {}, _config.target, function (response) {
      resultIntercept(response, callback, function () {
        if ($(_config.target).length) {
          $(_config.target).empty().html(response);
          var bootCSS = [];
          bootCSS.push(BuilderConstants.csspath + '/pagefont.css');
          bootCSS.push(BuilderConstants.csspath + '/pagelive.css');
          bootCSS.push(BuilderConstants.csspath + '/liveFont.css');
          scriptFunctions.loadFiles(bootCSS).then(function () {
            if (_config.content) {
              $('#pagecontent .zc-pb-page-content-wrapper').html(_config.content);
            }

            dashboardLive.init(callback);
          });
        }
      });
    });
  }

  function showPanelBuild(callback) {
    makeRequest(getUrl() + '?service=' + BuilderConstants.service + '&csspath=' + BuilderConstants.csspath, 'GET', {}, _config.target, function (response) {
      resultIntercept(response, callback, function () {
        if ($(_config.target).length) {
          $(_config.target).append("<div id='panelBuilder'></div>");
          $('#panelBuilder').append(response);

          if (_config.panelContent) {
            $('#PreviewCont').html(_config.panelContent);
          }

          panelBuilder.init(callback);
        }
      });
    });
  }
  /**
   * Initializes the page builder
   * @param {object} config Options required to initialize builder
   * @param {callbackfunction} callback Function to execute after builder initialize
   */


  function initBuilder(config, callback) {
    _config = config;

    if (!_config.pageId) {
      _config.type = 'create';
      intercept(callback, function createCall() {
        create(function (error, response) {
          if (!error) {
            _config.pageId = JSON.parse(response).pageId;
            initBuilder(_config, callback);
          } else if (callback) {
            callback(error);
          }
        });
      });
    } else {
      _config.type = 'edit';
      intercept(callback, function editCall() {
        edit(callback);
      });
    }
  }

  function showBuilder(config, callback) {
    config.afterOpen = callback;
    _config = config;
    _config.type = 'showBuilder';
    _config.scopeId = '';
    window.BuilderConstants = {};
    Object.keys(config).forEach(function (key) {
      window.BuilderConstants[key] = config[key];
    });
    intercept(callback, function createCall() {
      showBuild(function (error, response) {
        if (!error) {
          BuilderConstants.afterOpenResponse = response;
        } else {
          callback(error);
        }
      });
    });
  }

  function loadTemplateContent(content, callback) {
    document.getElementById('zcpage-builder-editorarea').innerHTML = content;
    $PBU.togglePlaceHolder();
    PageBuilder.fnHandlePageElementInit();
    $Builder.initTemplateBuilder();
    PageBuilder.handleCardSetting();
    $PBU.addPageElements();
    $PBU.defaultSelection();
    callback(afterServiceTemplateCall);
  }

  function afterServiceTemplateCall() {
    $resize.adjustHeightForElems('resize');
  }

  function destroyPageEnvironment() {
    setTimeout(function () {
      window.PSelect2 = window.Select2;
      window.Select2 = window.TSelect2;
      window.PreviousJQuery = window.$j;
      delete window.TSelect2;
      delete window.$j;
    }, 0);
  }

  function showLiveContent(config, callback) {
    _config = config;
    _config.type = 'showLiveContent';
    _config.scopeId = '';
    window.BuilderConstants = {};
    Object.keys(config).forEach(function (key) {
      window.BuilderConstants[key] = config[key];
    });
    intercept(callback, function createCall() {
      showLive(function (error, response) {
        if (!error) {
          callback(response);
        } else {
          callback(error);
        }
      });
    });
  }

  function showPanelBuilder(config, callback) {
    _config = config;
    _config.type = 'showPanelBuilder';
    window.BuilderConstants = {};
    Object.keys(config).forEach(function (key) {
      window.BuilderConstants[key] = config[key];
    });
    intercept(callback, function createCall() {
      showPanelBuild(function (error, response) {
        if (!error) {
          callback(response);
        } else {
          callback(error);
        }
      });
    });
  }

  function accessPage(config, callback) {
    config.type = 'live';
    _config = config;
    intercept(callback, function accessCall() {
      live(callback);
    });
  }

  function accessPdfPage(config, callback) {
    config.type = 'pdf';
    _config = config;
    intercept(callback, function pdfCall() {
      pdf(callback);
    });
  }

  function getPagesList(config, callback) {
    config.type = 'list';
    _config = config;
    intercept(callback, function listCall() {
      list(callback);
    });
  }

  function createPage(config, callback) {
    config.type = 'create';
    _config = config;
    intercept(callback, function createCall() {
      create(callback);
    });
  }

  function deletePage(config, callback) {
    config.type = 'delete';
    _config = config;
    intercept(callback, function deleteCall() {
      del(callback);
    });
  }

  function duplicatePage(config, callback) {
    config.type = 'duplicate';
    _config = config;
    intercept(callback, function duplicateCall() {
      duplicate(callback);
    });
  } // function extend() {
  //     for (var i = 1; i < arguments.length; i++)
  //         for (var key in arguments[i])
  //             if (arguments[i].hasOwnProperty(key))
  //                 arguments[0][key] = arguments[i][key];
  //     return arguments[0];
  // }


  return {
    init: initBuilder,
    create: createPage,
    deletePage: deletePage,
    access: accessPage,
    pdf: accessPdfPage,
    list: getPagesList,
    duplicate: duplicatePage,
    show: showBuilder,
    live: showLiveContent,
    call: makeRequest,
    initPanelBuilder: showPanelBuilder,
    destroyPageEnvironment: destroyPageEnvironment,
    loadTemplateContent: loadTemplateContent,
    afterServiceTemplateCall: afterServiceTemplateCall
  };
}(jQuery);