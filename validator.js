function Validator(formSelector, options){
    if (!options){
        options = {};
    }

    var formRules = {};

    function getParent(element, selector) {
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var validatorRules = {
        require: function(value){
            return value ? undefined : "Vui Lòng Nhập Trường Này!";
        },
        email: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Vui Lòng Nhập Email";
        },
        min: function(min){
            return function(value){
                return value.length >= min 
                    ? undefined 
                    : `Vui Lòng Nhập Tối Thiểu ${min} Kí Tự`;
            }
        },
        isConfirmed: function(getConfirmValue){
            return function(value){
                return value === getConfirmValue() 
                    ? undefined 
                    : "Mật khẩu nhập lại không chính xác";
            }
        }
    };

    var formElement = document.querySelector(formSelector);

    if (formElement){

        var inputs = formElement.querySelectorAll('[name][rules]');

        for (var input of inputs){

            var rules = input.getAttribute('rules').split("|");

            for (var rule of rules){

                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue){
                    if (rule === 'isConfirmed'){
                        ruleFunc = ruleFunc(function(){
                            return formElement.querySelector(ruleInfo[1]).value;
                        });
                    } else {
                        ruleFunc = ruleFunc(ruleInfo[1]);
                    }
                }

                if (Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            input.onblur = handleValidate;
            input.oninput = handleClear;
        }

        function handleValidate(event){
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules){
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            var formGroup = getParent(event.target, '.form-group');
            var formMessage = formGroup.querySelector('.form-message');

            if (errorMessage){
                formGroup.classList.add('invalid');
                formMessage.innerHTML = errorMessage;
            } else {
                formGroup.classList.remove('invalid');
                formMessage.innerHTML = '';
            }

            return !errorMessage;
        }

        function handleClear(event){
            var formGroup = getParent(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');
                formMessage.innerHTML = '';
            }
        }

        formElement.onsubmit = function(event){
            event.preventDefault();

            var isValid = true;

            for (var input of inputs){
                if (!handleValidate({target: input})){
                    isValid = false;
                }
            }

            if (isValid){
                if (typeof options.onsubmit === 'function'){
                    options.onsubmit();
                } else {
                    formElement.submit();
                }
            }
        };
    }
}