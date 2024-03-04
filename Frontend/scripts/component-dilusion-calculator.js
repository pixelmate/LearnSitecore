(function ($) {
    // Update hidden calculator input values to the main input's value (on keyup)
    $(document).on('keyup', '#calculator-main-input', function (e) {
     var mainInputValue = $('#calculator-main-input').val();
     $('.calculator input.input').val(mainInputValue);
 });

 // Update outputs for every calculator when the "calculate" button is clicked
 $('.calculator-calculate a').on('click', function () {
     updateCalculatorOutputs($('.calculator'));
 });

 $('#calculator-main-input').keypress(function (e) {
     if (e.keyCode === 13) {
         updateCalculatorOutputs($('.calculator'));
         return false;
     }
 });

 $('.dilution-rate-calculator .btn-reset').on('click', function () {
     $('.form-group .input').val('');
     $('.form-group .output').val('');
 });

 // Iterate over all calculator outputs and update each
 function updateCalculatorOutputs($parent) {
     $parent.find('.output').each(function (i, e) {
         updateOutput($(e), $parent);
     });
 }

 // Update a calculator output
 function updateOutput($output, $parent) {
     var formula = $output.data('formula');
     var parsed = parseFormula(formula, $parent);
     if (parsed !== false) {
         var formatted = formatOutput($output, parsed);
         $output.val(formatted);
     }
 }

 // Format the given output according to its output element's settings
 function formatOutput($el, value) {
     if ($el.data('format') == 'currency') {
         return "$" + value.formatMoney(2);
     }
     else {
         return value.formatMoney(2);
     }
 }

 // Return an evaluation of a formula
 //     $parent : parent calculator div
 function parseFormula(formula, $parent) {
     var keys = getKeys(formula);
     for (var i in keys) {
         var input = $($parent.find('#' + keys[i]));
         var value;
         if (input.hasClass('form-radios')) {
             var checked = $('input[name=' + input.attr('id') + ']:checked');
             value = checked ? checked.val() : null;
         } else {
             value = input.val();
         }
         if (!value)
             return false; // If one of the values is NaN, return false to abort parsing
         formula = formula.replace("{" + keys[i] + "}", value);
     }
     return eval(formula);
 }

 // Get referenced inputs (content inside "{}" brackets)
 function getKeys(formula) {
     return formula.match(/[^{}]+(?=\})/g);
 }

 // Load each calculator template into sibling container
 $('.dilution-rate-calculator .calculator').each(function (i, e) {
     var $calcContainer = $(e).next('.calculator-container');
     $calcContainer.empty();
     //$calcContainer.append($(e));
     initCalc($(e));
 });

 function templateinput($this){
     var template = `<div class="form-group row d-none">
         <div class="col-12 col-md-8">
             <label for="${$this.id}">${$this.label}</label>
         </div>
         <div class="col-12 col-md-4 position-right">
             <div class="quantity col">
                 <input type="text" class="form-control input number" id="${$this.id}" />
                 <span class="units">${$this.units}</span>
             </div>
         </div>
     </div>`;
     return template;
 }
 function templateoutput($this){
     var template = `<div class="form-group row">
         <div class="col-12 col-md-7 col-lg-8">
             <label for="${$this.id}">${$this.label}</label>
         </div>
         <div class="col-12 col-md-5 col-lg-4 position-right">
             <div class="quantity col">
                 <input type="text" class="form-control output number" data-formula="${$this.formula}" data-format="${$this.format}" id="${$this.id}" readonly/>
                 <span class="units">${$this.units}</span>
             </div>
         </div>
     </div>`;
     return template;
 }

 function initCalc($calculator) {
     var definition = JSON.parse($calculator.attr("data-result"));
     var fields = definition.fields;
     var renderedFields = [];
     for (var i in fields) {
         var type = fields[i].type;
         var rendered = "";
         if (type.indexOf('input') != -1 || type.indexOf('output') != -1 || type.indexOf('label') != -1) {
             type = type.replace('.', '-');
             rendered = (type == 'input') ? templateinput(fields[i]) : templateoutput(fields[i]);
             renderedFields.push(rendered);
         }
         // console.log(renderedFields);
     }
     $calculator.append(renderedFields);
 }

 // Add formatMoney() method to Number prototype
 Number.prototype.formatMoney = function (c, d, t) {
     var n = this,
         c = isNaN(c = Math.abs(c)) ? 2 : c,
         d = d == undefined ? "." : d,
         t = t == undefined ? "," : t,
         s = n < 0 ? "-" : "",
         i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
         j = (j = i.length) > 3 ? j % 3 : 0;
     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 }
})(jQuery);