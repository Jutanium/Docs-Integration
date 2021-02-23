'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}var script = {
  props: {
    sectionRegex: {
      type: RegExp,
      default: function _default() {
        return /<b>Section:(.+)<\/b>/g;
      }
    },
    sectionComponent: {
      type: Object
    },
    sectionTitleProp: {
      type: String,
      default: "title"
    },
    footnotesComponent: {
      type: Object
    },
    footnoteRefComponent: {
      type: Object
    },
    footnoteRefProp: {
      type: String,
      default: "number"
    },
    inlineComponents: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    blockComponents: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    docObj: Object
  },
  render: function render(h) {
    var _this = this;

    if (!this.docObj) {
      return h("p", "Loading...");
    }

    var map = function map(arraylike, func) {
      return Array.prototype.map.call(arraylike, func);
    };

    var nodeToVDOM = function nodeToVDOM(node) {
      if (node.nodeType == Node.TEXT_NODE) {
        var footnoteMatches = node.data.matchAll(/\[\^(\d+)\]/g);
        var inlineSlotMatches = node.data.matchAll(/\[\^(\d*[a-zA-z]+\d*)\](?:(.+)\[\/\1\])*/g);
        var insertions = [];

        var _iterator = _createForOfIteratorHelper(footnoteMatches),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var match = _step.value;
            var number = Number(match[1]);
            insertions.push({
              start: match.index,
              end: match.index + match[0].length,
              insert: h(_this.footnoteRefComponent, {
                props: _defineProperty({}, _this.footnoteRefProp, number)
              })
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        var _iterator2 = _createForOfIteratorHelper(inlineSlotMatches),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _match = _step2.value;
            var slotName = _match[1];
            var inner = _match[2];
            var slot = inner && _this.$scopedSlots[slotName] ? _this.$scopedSlots[slotName]({
              inner: inner
            }) : _this.$slots[slotName];

            if (slot) {
              insertions.push({
                start: _match.index,
                end: _match.index + _match[0].length,
                insert: slot
              });
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        if (!insertions.length) return node.data;
        var returnArr = [];
        var lastIndex = 0;
        insertions.sort(function (a, b) {
          return a.start - b.start;
        }).forEach(function (_ref) {
          var start = _ref.start,
              end = _ref.end,
              insert = _ref.insert;
          if (lastIndex != start) returnArr.push(node.data.slice(lastIndex, start));
          returnArr.push(insert);
          lastIndex = end;
        });
        if (lastIndex != node.data.length) returnArr.push(node.data.slice(lastIndex));
        return returnArr;
      }

      var attrs = Object.fromEntries(map(node.attributes, function (_ref2) {
        var name = _ref2.name,
            value = _ref2.value;
        return [name, value];
      }));

      if (node.hasChildNodes) {
        return h(node.tagName, {
          attrs: attrs
        }, map(node.childNodes, nodeToVDOM));
      }

      return h(node.tagName, {
        attrs: attrs
      });
    };

    var parseInner = function parseInner(innerData) {
      if (innerData) {
        var dummy = document.createElement("template");
        dummy.innerHTML = innerData;
        return map(dummy.content.childNodes, nodeToVDOM);
      }
    };

    var createFromObj = function createFromObj(obj) {
      var tag = Object.keys(obj)[0].toLowerCase();
      var data = obj[tag];

      if (tag == "table") {
        if (data.headers.length == 1 && data.rows.length == 0) {
          var slotName = data.headers[0];
          return _this.$slots[slotName];
        }

        if (data.headers.length >= 1 && data.headers[0] == "Component") {
          var componentName = data.headers[1];

          if (componentName in _this.blockComponents) {
            var component = _this.blockComponents[componentName];

            var realLength = function realLength(row) {
              return row.filter(function (cell) {
                return cell.length > 0;
              }).length;
            };

            var slotIndex = data.rows.findIndex(function (row) {
              return realLength(row) == 1;
            });
            var propRows = slotIndex > -1 ? data.rows.slice(0, slotIndex) : data.rows;
            var props = {};
            propRows.forEach(function (_ref3) {
              var _ref4 = _slicedToArray(_ref3, 2),
                  nameP = _ref4[0],
                  valueP = _ref4[1];

              var propName = nameP[0].p;
              var propValue = valueP[0].p;

              if (propName in component.props) {
                var _constructor = component.props[propName].type || component.props[propName];

                var coerced = typeof _constructor === "function" ? _constructor(propValue) : propValue;
                props[propName] = coerced;
              }
            });
            var children = data.rows[slotIndex][0].map(createFromObj);
            return h(component, {
              props: props
            }, children);
          }
        }
      }

      if (tag == "ol" || tag == "ul") {
        return h(tag, data.map(function (itemHTML) {
          return h("li", {
            domProps: {
              innerHTML: itemHTML
            }
          });
        }));
      }

      if (tag == "img") {
        var source = data.source,
            title = data.title,
            alt = data.alt;
        return h(tag, {
          attrs: {
            src: source,
            title: title,
            alt: alt
          }
        });
      }

      if (typeof data == "string") {
        return h(tag, parseInner(data));
      }
    };

    if (this.docObj && this.docObj.content) {
      var content = this.docObj.content.filter(function (obj) {
        return obj.p !== "";
      });
      var firstFootnoteIndex = content.findIndex(function (obj) {
        return obj.footnote;
      });
      var footnotes = firstFootnoteIndex > -1 ? content.slice(firstFootnoteIndex) : false;
      var bodyContent = footnotes ? content.slice(0, firstFootnoteIndex) : content;
      var renderArray = [];

      if (this.sectionRegex && this.sectionComponent) {
        var sections = [];
        bodyContent.forEach(function (el, index) {
          var _Object$entries$ = _slicedToArray(Object.entries(el)[0], 2),
              key = _Object$entries$[0],
              value = _Object$entries$[1];

          if (typeof value == "string") {
            var firstMatch = _this.sectionRegex.exec(value);

            if (firstMatch && firstMatch.length >= 1) {
              var pushObj = {
                index: index
              };

              if (firstMatch.length == 2) {
                pushObj.title = firstMatch[1];
              }

              sections.push(pushObj);
            }
          }
        });

        if (sections.length > 0) {
          var lastSectionEnd = bodyContent.length; //If there isn't an initial section, create one and put the preceding content in it

          if (sections[0].index != 0) {
            renderArray.push.apply(renderArray, _toConsumableArray(bodyContent.slice(0, sections[0].index).map(createFromObj)));
          }

          renderArray.push.apply(renderArray, _toConsumableArray(sections.map(function (_ref5, arrIndex) {
            var index = _ref5.index,
                title = _ref5.title;
            return h(_this.sectionComponent, {
              props: _defineProperty({}, _this.sectionTitleProp, title)
            }, bodyContent.slice(index + 1, sections[arrIndex + 1] ? sections[arrIndex + 1].index : lastSectionEnd).map(createFromObj));
          })));
        }
      } else {
        //No sections
        renderArray.push(bodyContent.map(createFromObj));
      }

      if (footnotes) {
        var slots = footnotes.map(function (obj) {
          return obj.footnote;
        }).map(function (_ref6, index) {
          var number = _ref6.number,
              text = _ref6.text;
          return h('template', {
            slot: number || String(index + 1)
          }, parseInner(text));
        });
        renderArray.push(h(this.footnotesComponent, slots));
      }

      return h('div', renderArray);
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}/* script */
var __vue_script__ = script;
/* template */

/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = "data-v-636a58a2";
/* module identifier */

var __vue_module_identifier__ = "data-v-636a58a2";
/* functional template */

var __vue_is_functional_template__ = undefined;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);/* eslint-disable import/prefer-default-export */var components=/*#__PURE__*/Object.freeze({__proto__:null,DocRenderer: __vue_component__});var install = function installDocRenderer(Vue) {
  if (install.installed) return;
  install.installed = true;
  Object.entries(components).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        componentName = _ref2[0],
        component = _ref2[1];

    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()


var plugin = {
  install: install
}; // To auto-install on non-es builds, when vue is found
// eslint-disable-next-line no-redeclare

/* global window, global */

{
  var GlobalVue = null;

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(plugin);
  }
} // Default export is library as a whole, registered via Vue.use()
exports.DocRenderer=__vue_component__;exports.default=plugin;