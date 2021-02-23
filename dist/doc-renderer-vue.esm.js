var script = {
  props: {
    sectionRegex: {
      type: RegExp,

      default() {
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
      default: () => ({})
    },
    blockComponents: {
      type: Object,
      default: () => ({})
    },
    docObj: Object
  },

  render(h) {
    if (!this.docObj) {
      return h("p", "Loading...");
    }

    const map = (arraylike, func) => Array.prototype.map.call(arraylike, func);

    const nodeToVDOM = node => {
      if (node.nodeType == Node.TEXT_NODE) {
        const footnoteMatches = node.data.matchAll(/\[\^(\d+)\]/g);
        const inlineSlotMatches = node.data.matchAll(/\[\^(\d*[a-zA-z]+\d*)\](?:(.+)\[\/\1\])*/g);
        const insertions = [];

        for (let match of footnoteMatches) {
          const number = Number(match[1]);
          insertions.push({
            start: match.index,
            end: match.index + match[0].length,
            insert: h(this.footnoteRefComponent, {
              props: {
                [this.footnoteRefProp]: number
              }
            })
          });
        }

        for (let match of inlineSlotMatches) {
          const slotName = match[1];
          const inner = match[2];
          const slot = inner && this.$scopedSlots[slotName] ? this.$scopedSlots[slotName]({
            inner
          }) : this.$slots[slotName];

          if (slot) {
            insertions.push({
              start: match.index,
              end: match.index + match[0].length,
              insert: slot
            });
          }
        }

        if (!insertions.length) return node.data;
        const returnArr = [];
        let lastIndex = 0;
        insertions.sort((a, b) => a.start - b.start).forEach(({
          start,
          end,
          insert
        }) => {
          if (lastIndex != start) returnArr.push(node.data.slice(lastIndex, start));
          returnArr.push(insert);
          lastIndex = end;
        });
        if (lastIndex != node.data.length) returnArr.push(node.data.slice(lastIndex));
        return returnArr;
      }

      const attrs = Object.fromEntries(map(node.attributes, ({
        name,
        value
      }) => [name, value]));

      if (node.hasChildNodes) {
        return h(node.tagName, {
          attrs
        }, map(node.childNodes, nodeToVDOM));
      }

      return h(node.tagName, {
        attrs
      });
    };

    const parseInner = innerData => {
      if (innerData) {
        const dummy = document.createElement("template");
        dummy.innerHTML = innerData;
        return map(dummy.content.childNodes, nodeToVDOM);
      }
    };

    const createFromObj = obj => {
      const tag = Object.keys(obj)[0].toLowerCase();
      const data = obj[tag];

      if (tag == "table") {
        if (data.headers.length == 1 && data.rows.length == 0) {
          const slotName = data.headers[0];
          return this.$slots[slotName];
        }

        if (data.headers.length >= 1 && data.headers[0] == "Component") {
          const componentName = data.headers[1];

          if (componentName in this.blockComponents) {
            const component = this.blockComponents[componentName];

            const realLength = row => row.filter(cell => cell.length > 0).length;

            const slotIndex = data.rows.findIndex(row => realLength(row) == 1);
            const propRows = slotIndex > -1 ? data.rows.slice(0, slotIndex) : data.rows;
            let props = {};
            propRows.forEach(([nameP, valueP]) => {
              const propName = nameP[0].p;
              const propValue = valueP[0].p;

              if (propName in component.props) {
                const constructor = component.props[propName].type || component.props[propName];
                const coerced = typeof constructor === "function" ? constructor(propValue) : propValue;
                props[propName] = coerced;
              }
            });
            const children = data.rows[slotIndex][0].map(createFromObj);
            return h(component, {
              props
            }, children);
          }
        }
      }

      if (tag == "ol" || tag == "ul") {
        return h(tag, data.map(itemHTML => h("li", {
          domProps: {
            innerHTML: itemHTML
          }
        })));
      }

      if (tag == "img") {
        const {
          source,
          title,
          alt
        } = data;
        return h(tag, {
          attrs: {
            src: source,
            title,
            alt
          }
        });
      }

      if (typeof data == "string") {
        return h(tag, parseInner(data));
      }
    };

    if (this.docObj && this.docObj.content) {
      const content = this.docObj.content.filter(obj => obj.p !== "");
      const firstFootnoteIndex = content.findIndex(obj => obj.footnote);
      const footnotes = firstFootnoteIndex > -1 ? content.slice(firstFootnoteIndex) : false;
      const bodyContent = footnotes ? content.slice(0, firstFootnoteIndex) : content;
      const renderArray = [];

      if (this.sectionRegex && this.sectionComponent) {
        const sections = [];
        bodyContent.forEach((el, index) => {
          const [key, value] = Object.entries(el)[0];

          if (typeof value == "string") {
            const firstMatch = this.sectionRegex.exec(value);

            if (firstMatch && firstMatch.length >= 1) {
              let pushObj = {
                index
              };

              if (firstMatch.length == 2) {
                pushObj.title = firstMatch[1];
              }

              sections.push(pushObj);
            }
          }
        });

        if (sections.length > 0) {
          const lastSectionEnd = bodyContent.length; //If there isn't an initial section, create one and put the preceding content in it

          if (sections[0].index != 0) {
            renderArray.push(...bodyContent.slice(0, sections[0].index).map(createFromObj));
          }

          renderArray.push(...sections.map(({
            index,
            title
          }, arrIndex) => h(this.sectionComponent, {
            props: {
              [this.sectionTitleProp]: title
            }
          }, bodyContent.slice(index + 1, sections[arrIndex + 1] ? sections[arrIndex + 1].index : lastSectionEnd).map(createFromObj))));
        }
      } else {
        //No sections
        renderArray.push(bodyContent.map(createFromObj));
      }

      if (footnotes) {
        const slots = footnotes.map(obj => obj.footnote).map(({
          number,
          text
        }, index) => {
          return h('template', {
            slot: number || String(index + 1)
          }, parseInner(text));
        });
        renderArray.push(h(this.footnotesComponent, slots));
      }

      return h('div', renderArray);
    }
  }

};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}

/* script */
const __vue_script__ = script;
/* template */

/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = "data-v-636a58a2";
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = undefined;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

/* eslint-disable import/prefer-default-export */

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  DocRenderer: __vue_component__
});

// Import vue components

const install = function installDocRenderer(Vue) {
  if (install.installed) return;
  install.installed = true;
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()


const plugin = {
  install
}; // To auto-install on non-es builds, when vue is found

export default plugin;
export { __vue_component__ as DocRenderer };
