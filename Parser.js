/**
 * Created by podko on 23.08.2015.
 */


var Parser = function (obj) {
    this.grammarObject = obj;
    this.string = "";
    this.model;
    this.parse = function (string) {

        var model = this.model = {
            children: []
        };
        this.string = string;
        var result = this.match(this.getRuleByName(Object.keys(this.grammarObject)[0]));
        if (result)
            return this.model;
        return result;
    };

    this.getMatch = function (stringRegExp) {

        var exp = new RegExp("^" + stringRegExp);
        return exp.exec(this.string);
    };

    this.process = function (item) {

        switch (typeof item) {
            case "string":
                if (item[0] == '%' && item[item.length - 1] == '%') {
                    var model = {
                        children: [],
                        name: item.substr(1, item.length - 2),
                        parent: this.model
                    };
                    this.model.children.push(model);
                    this.model = model;

                    var result = this.match(this.getRuleByName(model.name));
                    this.model = model.parent;
                    return result;
                }
                else {
                    var match = this.getMatch(item, this.string);
                    if (match == null)
                        return false;
                    this.string = this.string.substr(match[0].length);
                    if (match.length > 1) {
                        if (!this.model.children)
                            this.model.children = [];
                        this.model.children.push(match[1]);
                    }
                    return true;
                }
                break;
            case "object":
                if (Array.isArray(item)) { // alternatives
                    for (var i = 0; i < item.length; i++) {
                        if (this.process(item[i]))
                            return true;
                    }
                    return false;
                } else { // repeatable
                    var match;
                    while (match = this.match(item.grammar)) {
                        if (item.repeat == '?')
                            break;
                    }
                    if (item.repeat == '?' || item.repeat == '*')
                        return true;
                    else if (item.repeat == '+')
                        return match != null;
                    break;
                }
        }
        throw "WTFException";
    };

    this.match = function (rule) {

        var a;
        for (var i = 0; i < rule.length; i++) {
            if (!this.process(rule[i]))
                return false;
        }
        return true;
    };

    this.matchAlternatives = function (alternatives, string, model) {

        for (var i = 0; i < alternatives.length; i++) {
            this.match(alternatives[i]);
        }
    };

    this.getRuleByName = function (name) {

        var rule = this.grammarObject[name];
        rule.name = name; // just for debug
        return rule;
    }
};