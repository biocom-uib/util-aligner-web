var BASE_URL =  'https://biocom.uib.es/util-aligner/v2';
var DATABASE_URL = BASE_URL + '/database';
var NETWORKS_URL = BASE_URL + '/networks';
var ALIGNERS_URL = BASE_URL + '/aligner';
var SUBMIT_URL = BASE_URL + '/create-job';

var STRINGDB_SCORE_TYPES = {
  'equiv_nscore':                    "Neighborhood score",
  'equiv_nscore_transferred':        "Neighborhood score from other species",
  'equiv_fscore':                    "Fusion score",
  'equiv_pscore':                    "Coocurrence score",
  'equiv_hscore':                    "Homology score",
  'array_score':                     "Coexpression score",
  'array_score_transferred':         "Coexpression score transferred from other species",
  'experimental_score':              "Experimental score",
  'experimental_score_transferred':  "Experimental score transferred by homology from other species",
  'database_score':                  "Database score",
  'database_score_transferred':      "Database score transferred by homology from other species",
  'textmining_score':                "Textmining score",
  'textmining_score_transferred':    "Textmining score transferred by homology from other species"
}

function fillSelectOptions(select, data) {
  select.empty();

  for (var idx in data) {
    var obj = data[idx]
    select.append(new Option(obj.text, obj.value));
  }

  select.selectpicker('refresh');
  select.val(null).trigger('change');
  select.trigger('change');
}

function fetchDatabases() {
  $.ajax(DATABASE_URL, {
    dataType: 'json',
    contentType: 'json',

    success: function(data, textStatus, jqXHR) {
      fillSelectOptions($('#database'), data.data);
    },

    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch databases: ' + errorThrown);
    }
  });
}

function fetchAligners() {
  $.ajax(ALIGNERS_URL, {
    dataType: 'json',
    contentType: 'json',

    success: function(data, textStatus, jqXHR) {
      fillSelectOptions($('#aligner'), data.data)
    },

    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch aligners: ' + errorThrown);
    }
  });
}

function fetchNetworks(database) {
  if (database !== null && database !== "") {
    $.ajax(NETWORKS_URL + '/' + database, {
      dataType: 'json',
      contentType: 'json',

      success: function(data, textStatus, jqXHR) {
        fillSelectOptions($('#input-network'), data.data);
        fillSelectOptions($('#output-network'), data.data);
      },

      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Failed to fetch networks for database "' + database + '": ' + errorThrown)
      }
    });
  }
}

function generateStringDbFilters() {
  ['input', 'output'].forEach(function(prefix) {
    var parent = $('#' + prefix + '-stringdb-edge-selection');

    for (var score_type in STRINGDB_SCORE_TYPES) {
      parent.append(
        $('<div>', {
          class: 'form-group',
        })
        .append(
          $('<div>', {
            class: 'checkbox'
          })
          .append(
            $('<label>', {
              'for':         prefix + '-stringdb-edge-score-' + score_type + '-threshold',
              'data-toggle': 'collapse',
              'data-target': '#' + prefix + '-stringdb-edge-score-' + score_type + '-threshold-div'
            })
            .append(
              $('<input>', {
                type:     'checkbox',
                class:    'stringdb-edge-score-check',
                name:     prefix + '-stringdb-edge-score-' + score_type + '-check',
                id:       prefix + '-stringdb-edge-score-' + score_type + '-check',
                disabled: true
              })
            )
            .append(
              $('<span>', {
                text: ' ' + STRINGDB_SCORE_TYPES[score_type]
              })
            )
          )
        )
        .append(
          $('<div>', {
            class: 'collapse stringdb-edge-score-threshold-div',
            id:    prefix + '-stringdb-edge-score-' + score_type + '-threshold-div'
          })
          .append(
            $('<input>', {
              class: 'form-control stringdb-edge-score-threshold',
              type:  'number',
              min:   0,
              max:   1000,
              value: 0,
              name:  prefix + '-stringdb-edge-score-' + score_type + '-threshold',
              id:    prefix + '-stringdb-edge-score-' + score_type + '-threshold'
            })
          )
        )
      )
    }
  });
}

function setupValidation(submitHandler) {
  var rules = {
    database: 'required',
    aligner: 'required',
    email: { required: true, email: true },
  };

  var messages = {
    database: "Please select a database",
    aligner: "Please choose an aligner",

    email: {
      required: "The e-mail is required to send the results",
      email: "Please use a valid e-mail address"
    }
  };

  var isStringDB = function(element) {
    return $('#database').val() === 'stringdb';
  };

  ['input', 'output'].forEach(function(prefix) {
    rules[prefix + '-network-file'] = {
      required: '#' + prefix + '-network-custom.active',
      accept: 'text/tab-separated-values'
    };
    messages[prefix + '-network-file'] = "Please upload a network file";

    rules[prefix + '-network'] = { required: '#' + prefix + '-network-predefined.active' }
    messages[prefix + '-network'] = "Please choose a network";

    rules[prefix + '-stringdb-selection-count'] = {
      number: true,
      min: {
        param: 1,
        depends: isStringDB
      }
    };

    messages[prefix + '-stringdb-selection-count'] = "Choose at least one edge type";

    for (var score_type in STRINGDB_SCORE_TYPES) {
      var key_threshold = prefix + '-stringdb-edge-score-' + score_type + '-threshold';

      rules[key_threshold] = {
        required: '#' + prefix + '-stringdb-edge-score-' + score_type + '-check:checked',
        range: [0,1000],
        digits: true
      };

      messages[key_threshold] = "Must be a number from 0 to 1000";
    }
  });

  $('#alignment-form').validate({
    rules: rules,
    messages: messages,
    ignore: [],

    submitHandler: function(form, event) {
      event.preventDefault();
      submitHandler();
    },

    errorElement: "span",
    errorPlacement: function(error, element) {
      error.addClass('invalid-feedback');

      var form_group = $(element).closest('.form-group');

      if (form_group.length > 0) {
        form_group.append(error);
      } else {
        element.after(error);
      }
    },

    highlight: function(element, errorClass, validClass) {
      $(element).addClass('is-invalid').removeClass('is-valid');
      $(element).parents('.collapse:not(.show)').collapse('show');
    },

    unhighlight: function(element, errorClass, validClass) {
      $(element).addClass('is-valid').removeClass('is-invalid');
    }
  });

}

function readFile(file, cb) {
  var reader = new FileReader();

  reader.onload = function() {
    cb(reader.result);
  };

  reader.readAsText(file);
}

function submitAlignment() {
  var reqBody = {
    db: $('#database').val(),
    aligner: $('#aligner').val(),
    mail: $('#email').val(),

    net1: { edges: null },
    net2: { edges: null },
  };

  if (reqBody.db == 'stringdb') {
    reqBody.net1.species_id = null;
    reqBody.net2.species_id = null;
  }

  function addNetworks(net_key, prefix) {
    if ($('#' + prefix + '-network-predefined.active').length > 0) {
      if (reqBody.db === 'stringdb') {
        reqBody[net_key].species_id = $('#' + prefix + '-network').val();
        reqBody[net_key].score_thresholds = {};

        for (var score_type in STRINGDB_SCORE_TYPES) {
          if ($('#' + prefix + '-stringdb-edge-score-' + score_type + '-check:checked').length > 0) {
            var val = $('#' + prefix + '-stringdb-edge-score-' + score_type + '-threshold').val();
            reqBody[net_key].score_thresholds[score_type] = parseInt(val);
          }
        }
      }

      continueAfterNetworks(net_key, prefix);

    } else {
      readFile($('#' + prefix + '-network-file')[0].files[0], function(contents) {
        reqBody[net_key].edges = contents;
        continueAfterNetworks(net_key, prefix);
      });
    }
  }

  function continueAfterNetworks(net_key, prefix) {
    if (net_key === 'net1') {
      addNetworks('net2', 'output');
    } else if (net_key === 'net2') {
      doSubmit();
    }
  }

  function doSubmit() {
    $.ajax(SUBMIT_URL, {
      type: "POST",
      dataType: 'json',
      contentType: 'json',
      data: JSON.stringify(reqBody),

      success: function(data, textStatus, jqXHR) {
        if (data.job_id !== null) {
          $('#submitted-job-id').text(data.job_id);
          $('#alignment-submitted-modal').modal();
        } else {
          $('#alignment-precomputed-modal').modal();
        }
      },

      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Failed to submit alignment:' + errorThrown);
        $('#submission-error-text').text(errorThrown);
        $('#alignment-submission-error-modal').modal();
      }
    });
  }

  addNetworks('net1', 'input');
}

$(document).ready(function() {
  generateStringDbFilters();

  $('select:not(.live-search)').selectpicker();

  $('select.live-search').selectpicker({
    liveSearch: true,
    liveSearchPlaceholder: 'Type to search',
    selectOnTab: true,
    virtualScroll: 100
  });

  $('#aligner-options-btn').click(function() {
    var aligner = $('#aligner').val();

    if (aligner !== "") {
      $('#' + aligner + '-options-modal').modal();
    }
  });

  $('.stringdb-edge-score-threshold-div').on('shown.bs.collapse hidden.bs.collapse', function() {
    var self = $(this);

    self
      .closest('.form-group')
      .find('input[type=checkbox]')
      .prop('checked', !self.is(':hidden'));

    var num_filters = self
      .closest('.stringdb-edge-selection')
      .find('.stringdb-edge-score-check:checked')
      .length;

    var card = self.closest('.card');
    card.find('span.selection-count').text(num_filters);
    card.find('input.selection-count').val(num_filters);
  });

  $('#database').change(function() {
    fetchNetworks($('#database').val());

    if ($('#database').val() === 'stringdb') {
      $('.stringdb-only:hidden').fadeIn();
    } else {
      $('.stringdb-only:visible').fadeOut();
    }
  });

  $('#button-howto').click(function() {
    window.open('howto.pdf', '_blank')
  });

  setupValidation(submitAlignment);

  fetchDatabases();
  fetchAligners();
});
