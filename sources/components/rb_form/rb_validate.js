(function(factory) {
    if(typeof define === 'function' && define.amd){
        define(factory);
    }
    else if(typeof module == 'object' && module.exports){
        module.exports = factory();
    } else {
        factory();
    }
}( function() {
    'use strict';
    var $ = rb.$;
    var lReg = /</g;
    var gReg = />/g;
    var classes = {
        valid: 'is-valid',
        invalid: 'is-invalid',
        errorBox: 'form-errorbox'
    };
    var requestAnimationFrame = requestAnimationFrame || setTimeout;
    var rbValidation = window.rbValidation || {};

    if(!rbValidation.messages){
        rbValidation.messages = {};
    }

    if(!rbValidation.messages['']){
        rbValidation.messages[''] = {};
    }

    rbValidation.getMessage = function(element, errorType){
        var message;
        var elemType = element.getAttribute('type') || element.type;
        var customMessage = element._rbCustomMessages;

        errorType = errorType || rbValidation.getErrorType(element);

        if(customMessage){
            message = customMessage[errorType] || customMessage.defaultMessage;
        } else {
            message = rbValidation.messages[''][errorType] || rbValidation.messages[''].defaultMessage;

            if(typeof message == 'object'){
                message = message[elemType] || message[element.localName] || message.defaultMessage;
            }
        }

        if(!message || typeof message == 'object'){
            message = element.validationMessage;
        }

        return rbValidation.formatMessage(element, message || '');
    };

    rbValidation.formatMessage = function(element, message){
        var val = element.title;

        message = '<span class="js-errormessage-content"> '+ message +' </span>';

        if(val){
            val = '<span class="js-titlevalue">'+ val.replace(lReg, '&lt;').replace(gReg, '&gt;') +'</span>';
        }

        if(message.indexOf('{%title}') != -1){
            message = message.replace('{%title}', val);
        } else if(val) {
            message = message+' '+val;
        }

        if(message && message.indexOf('{%') != -1){
            ['value', 'min', 'max', 'maxlength', 'minlength', 'label'].forEach(function(attr){

                if(message.indexOf('{%'+attr) === -1){return;}

                var val = ((attr == 'label') ?
                    ((element.form || document).querySelector('label[for="'+ element.id +'"]').textContent || '') .replace(/\*$|:$/, '') :
                    element[attr] || element.getAttribute(attr) || '') || ''
                ;

                val = ''+val;

                message = message.replace('{%'+ attr +'}', val.replace(lReg, '&lt;').replace(gReg, '&gt;'));
                if('value' == attr){
                    message = message.replace('{%valueLen}', val.length);
                }

            });
        }
        return message;
    };

    rbValidation.getErrorType = function(element){
        var error;
        var retType = '';
        var validity = element.validity;
        for(error in validity){
            if(error != 'valid' && validity[error] === true){
                retType = error == 'badInput' ? 'typeMismatch' : error;
            }
        }
        return retType;
    };

    if(!rbValidation.rules){
        rbValidation.rules = {
            /*
            'data-foo': function(elem, value, attrValue, resultCallback){
                resultCallback(value == attrValue ? false : 'error must be: '+ attrValue);
            }
            */
        };
    }

    rbValidation.evalCustomRule = function(ruleKey, elem, value, ruleValue){
        var createPromise = function(){

            elem._customRulePromise = new Promise(function(resolve){

                rbValidation.rules[ruleKey](elem, value, ruleValue, function(result){

                    if(elem._customRulePromise){
                        delete elem._customRulePromise;
                    }

                    if(result){
                        elem.setCustomValidity(result);
                        elem._rbCurrentFailedRule = ruleKey;
                        resolve(result);
                    } else {
                        if(elem._rbCurrentFailedRule == ruleKey){
                            delete elem._rbCurrentFailedRule;
                            elem.setCustomValidity('');
                        }
                        resolve();
                    }

                });
            });
        };

        if(elem._customRulePromise){
            elem._customRulePromise.then(function(error){
                if(!error){
                    createPromise();
                } else if(elem._customRulePromise){
                    delete elem._customRulePromise;
                }
            });
        } else {
            createPromise();
        }
    };

    rbValidation.runCustomRules = function(elem){
        var value = elem.value;

        var runCustomValidation = function(error){
            var ruleKey, ruleValue;
            if(!error && elem.validity.valid){

                for(ruleKey in rbValidation.rules){

                    ruleValue = elem.getAttribute(ruleKey);

                    if(ruleValue != null){
                        rbValidation.evalCustomRule(ruleKey, elem, value, ruleValue);
                    }
                }

            }
        };

        if(elem._rbCurrentFailedRule){
            rbValidation.evalCustomRule(elem._rbCurrentFailedRule, elem, value, elem.getAttribute(elem._rbCurrentFailedRule));
        }

        if(elem._customRulePromise){
            elem._customRulePromise.then(runCustomValidation);
        } else {
            runCustomValidation();
        }

        return new Promise(function(resolve){
            var lastPromise;
            var check = function(){
                if(elem._customRulePromise && lastPromise != elem._customRulePromise){
                    lastPromise = elem._customRulePromise;
                    elem._customRulePromise.then(check);
                } else {
                    if(elem._customRulePromise){
                        delete elem._customRulePromise;
                    }
                    resolve();
                }
            };
            check();
        });
    };

    rbValidation.component = rb.Component.extend('validate', {
        defaults: {
            scrollEasing: 'ease-in',
            scrollDuration: 400,
            animateError: true,
        },

        init: function(element){
            this._super(element);

            this.$element = $(element);

            if(this.element.checkValidity){
                this.updateValidity();
                this.setup();
            }
        },

        setup: function(){
            var that = this;
            var noChangeCommit = {
                range: 1,
                date: 1,
                number: 1
            };
            var setUpdateState = function(elem, action){
                if(!elem.willValidate || elem.type == 'submit' || elem._isSettingValidate){return;}
                elem._isSettingValidate = true;
                requestAnimationFrame(function(){
                    that[action](elem);
                    if(elem._isSettingValidate){
                        delete elem._isSettingValidate;
                    }
                });
            };
            var setState = function(e){
                setUpdateState(e.target, 'setState');
            };
            var updateState = function(e){
                setUpdateState(e.target, 'updateState');
            };

            this.$element
                .attr({novalidate: ''})
                .on('focusout', 'input, select, textarea', updateState)
                .on('invalid', setState)
                .on('change', 'input, select, textarea', function(e){
                    if(noChangeCommit[e.target.type]){return;}
                    updateState(e);
                })
            ;

            this.element.addEventListener('submit', function(e){
                var $invalids = that.$element.find('input:invalid, select:invalid, textarea:invalid');

                if($invalids.length){
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }

                $invalids.each(function(index){
                    that.setState(this, index === 0);
                });
            }, true);
        },

        getWrapperBox: function(element){
            var wrapperBox = element.parentNode;
            while(wrapperBox && wrapperBox.matches('span, p, label, .js-validation-group *')){
                wrapperBox = wrapperBox.parentNode;
            }
            return $(wrapperBox);
        },

        hasContent: function($inputs){
            var hasContent = true;
            $inputs.each(function(){
                if(hasContent && this.willValidate){
                    if(this.type != 'checkbox' && this.type != 'radio' && !this.value){
                        hasContent = false;
                    }
                }
            });
            return hasContent;
        },
        updateValidity: function(element){
            if(element){
                rbValidation.runCustomRules(element);
            } else {
                this.$element.find('input, select, textarea').each(function(){
                    rbValidation.runCustomRules(this);
                });
            }
        },
        updateState: function(element){
            var that = this;
            rbValidation.runCustomRules(element).then(function(){
                that.setState(element);
            });
        },
        setState: function(element, intoView){
            var $wrapper = this.getWrapperBox(element);
            var $inputs = $wrapper.find('input, select, textarea');
            var $invalids = $inputs.filter(':invalid');

            if($invalids.length){
                this.setInvalid($wrapper, $invalids);
            } else if(this.hasContent($inputs)){
                this.setValid($wrapper, $inputs);
            } else {
                this.resetState($wrapper, $inputs);
            }

            if(intoView){
                $wrapper.scrollIntoView({
                    focus: $invalids.get(0) || $inputs.get(0),
                    duration: this.options.scrollDuration,
                    easing: this.options.scrollEasing
                });
            }
        },

        getErrorType: function($invalids){
            return rbValidation.getErrorType($invalids.get(0));
        },

        getErrorBox: function($wrapper){
            var $errorBox = $wrapper.get(0)._rbErrorBox;

            if(!$errorBox){
                $errorBox = $wrapper.find('.' + classes.errorBox);

                if($errorBox.length){

                } else {
                    $wrapper.append('<div class="' + classes.errorBox + '"></div>');
                    $errorBox = $wrapper.find('.' + classes.errorBox);
                }

                $wrapper.get(0)._rbErrorBox = $errorBox;
            }

            return $errorBox;
        },

        getErrorMessage: function($invalids, errorState){
            return rbValidation.getMessage($invalids.get(0), errorState);
        },

        resetState: function($wrapper, $invalids){
            if(this.options.animateError && $wrapper.is('.' + classes.invalid)){
                this.getErrorBox($wrapper).rbSlideUp($wrapper);
            }
            $wrapper
                .removeAttr('data-validitystate')
                .removeClass(classes.invalid)
                .removeClass(classes.valid)
            ;
        },

        setInvalid: function($wrapper, $invalids){
            var $errorBox;
            var errorState = this.getErrorType($invalids);
            var currentValidation = $wrapper.attr('data-validitystate');

            if(errorState != currentValidation){
                $errorBox = this.getErrorBox($wrapper);
                $errorBox.html('<p class="form-errormessage">'+ this.getErrorMessage($invalids, errorState) +'</p>');
                if(this.options.animateError){
                    $errorBox.rbSlideDown();
                }
                $wrapper
                    .attr({'data-validitystate': errorState})
                    .removeClass(classes.valid)
                    .addClass(classes.invalid)
                ;

            }
        },

        setValid: function($wrapper, $invalids){
            this.resetState($wrapper, $invalids);
            $wrapper.addClass(classes.valid);
        }
    });

    window.rb.validation = rbValidation;
    return rbValidation;
}));
