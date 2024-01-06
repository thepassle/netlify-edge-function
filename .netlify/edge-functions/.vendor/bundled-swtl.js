
  import __nfyProcess from "node:process";
  import {setImmediate as __nfySetImmediate, clearImmediate as __nfyClearImmediate} from "node:timers";
  import {Buffer as __nfyBuffer} from "node:buffer";
  import {createRequire as ___nfyCreateRequire} from "node:module";
  import {fileURLToPath as ___nfyFileURLToPath} from "node:url";
  import {dirname as ___nfyPathDirname} from "node:path";
  let __filename=___nfyFileURLToPath(import.meta.url);
  let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
  let require=___nfyCreateRequire(import.meta.url);
  globalThis.process = __nfyProcess;
  globalThis.setImmediate = __nfySetImmediate;
  globalThis.clearImmediate = __nfyClearImmediate;
  globalThis.Buffer = __nfyBuffer;
  

// node_modules/swtl/symbol.js
var COMPONENT_SYMBOL = Symbol("component");
var AWAIT_SYMBOL = Symbol("await");

// node_modules/swtl/html.js
var TEXT = "TEXT";
var COMPONENT = "COMPONENT";
var NONE = "NONE";
var PROP = "PROP";
var CHILDREN = "CHILDREN";
var SET_PROP = "SET_PROP";
var PROP_VAL = "PROP_VAL";
function* html(statics, ...dynamics) {
  if (!dynamics.length) {
    yield* statics;
  } else if (!dynamics.some((d) => typeof d === "function")) {
    yield* statics.reduce((acc, s, i) => [...acc, s, ...dynamics.length > i ? [dynamics[i]] : []], []);
  } else {
    let MODE = TEXT;
    let COMPONENT_MODE = NONE;
    let PROP_MODE = NONE;
    const componentStack = [];
    for (let i = 0; i < statics.length; i++) {
      let result = "";
      const component = {
        kind: COMPONENT_SYMBOL,
        properties: [],
        children: [],
        fn: void 0
      };
      for (let j = 0; j < statics[i].length; j++) {
        let c = statics[i][j];
        if (MODE === TEXT) {
          if (c === "<" && /**
           * @example <${Foo}>
           *           ^
           */
          !statics[i][j + 1] && typeof dynamics[i] === "function") {
            MODE = COMPONENT;
            component.fn = dynamics[i];
            componentStack.push(component);
          } else {
            result += c;
          }
        } else if (MODE === COMPONENT) {
          if (COMPONENT_MODE === PROP) {
            const component2 = componentStack[componentStack.length - 1];
            const property = component2?.properties[component2.properties.length - 1];
            if (PROP_MODE === SET_PROP) {
              let property2 = "";
              while (statics[i][j] !== "=" && statics[i][j] !== "/" && statics[i][j] !== ">" && statics[i][j] !== '"' && statics[i][j] !== "'" && statics[i][j] !== " " && property2 !== "...") {
                property2 += statics[i][j];
                j++;
              }
              if (statics[i][j] === "=") {
                PROP_MODE = PROP_VAL;
              } else if (statics[i][j] === "/" && COMPONENT_MODE === PROP) {
                COMPONENT_MODE = NONE;
                PROP_MODE = NONE;
                const component3 = componentStack.pop();
                if (!componentStack.length) {
                  result = "";
                  yield component3;
                }
              } else if (statics[i][j] === ">" && COMPONENT_MODE === PROP) {
                COMPONENT_MODE = CHILDREN;
                PROP_MODE = NONE;
              }
              if (property2 === "...") {
                component2.properties.push(...Object.entries(dynamics[i]).map(([name, value]) => ({ name, value })));
              } else if (property2) {
                component2.properties.push({ name: property2, value: true });
              }
            } else if (PROP_MODE === PROP_VAL) {
              if (statics[i][j] === '"' || statics[i][j] === "'") {
                const quote = statics[i][j];
                if (!statics[i][j + 1]) {
                  property.value = dynamics[i];
                  PROP_MODE = SET_PROP;
                } else {
                  let val = "";
                  j++;
                  while (statics[i][j] !== quote) {
                    val += statics[i][j];
                    j++;
                  }
                  property.value = val || "";
                  PROP_MODE = SET_PROP;
                }
              } else if (!statics[i][j - 1]) {
                property.value = dynamics[i - 1];
                PROP_MODE = SET_PROP;
                if (statics[i][j] === ">") {
                  PROP_MODE = NONE;
                  COMPONENT_MODE = CHILDREN;
                } else if (statics[i][j] === "/") {
                  const component3 = componentStack.pop();
                  if (!componentStack.length) {
                    PROP_MODE = NONE;
                    COMPONENT_MODE = NONE;
                    MODE = TEXT;
                    j++;
                    yield component3;
                  }
                }
              } else {
                let val = "";
                while (statics[i][j] !== " " && statics[i][j] !== "/" && statics[i][j] !== ">") {
                  val += statics[i][j];
                  j++;
                }
                property.value = val || "";
                PROP_MODE = SET_PROP;
                if (statics[i][j] === "/") {
                  const component3 = componentStack.pop();
                  if (!componentStack.length) {
                    yield component3;
                  }
                }
              }
            }
          } else if (COMPONENT_MODE === CHILDREN) {
            const currentComponent = componentStack[componentStack.length - 1];
            if (statics[i][j] === "<" && statics[i][j + 1] === "/" && statics[i][j + 2] === "/") {
              if (result) {
                currentComponent.children.push(result);
                result = "";
              }
              j += 3;
              const component2 = componentStack.pop();
              if (!componentStack.length) {
                MODE = TEXT;
                COMPONENT_MODE = NONE;
                yield component2;
              }
            } else if (statics[i][j] === "<" && !statics[i][j + 1] && typeof dynamics[i] === "function") {
              if (result) {
                currentComponent.children.push(result);
                result = "";
              }
              COMPONENT_MODE = PROP;
              PROP_MODE = SET_PROP;
              component.fn = dynamics[i];
              componentStack.push(component);
            } else if (!statics[i][j + 1]) {
              if (result && currentComponent) {
                result += statics[i][j];
                currentComponent.children.push(result);
              }
            } else {
              result += statics[i][j];
            }
          } else if (c === ">") {
            COMPONENT_MODE = CHILDREN;
          } else if (c === " ") {
            COMPONENT_MODE = PROP;
            PROP_MODE = SET_PROP;
          } else if (c === "/" && statics[i][j + 1] === ">") {
            MODE = TEXT;
            COMPONENT_MODE = NONE;
            const component2 = componentStack.pop();
            if (!componentStack.length) {
              result = "";
              yield component2;
            }
            j++;
          } else {
            result += c;
          }
        } else {
          result += c;
        }
      }
      if (COMPONENT_MODE === CHILDREN && dynamics.length > i) {
        const currentComponent = componentStack[componentStack.length - 1];
        currentComponent.children.push(dynamics[i]);
      }
      if (result && COMPONENT_MODE !== CHILDREN) {
        yield result;
      }
      if (componentStack.length > 1 && component.fn) {
        componentStack[componentStack.length - 2].children.push(component);
      }
      if (dynamics.length > i && MODE !== COMPONENT) {
        yield dynamics[i];
      }
    }
  }
}

// node_modules/swtl/await.js
function Await({ promise, children }) {
  return {
    promise,
    template: children.find((c) => typeof c === "function")
  };
}
Await.kind = AWAIT_SYMBOL;
var when = (condition, template) => condition ? template() : "";

// node_modules/swtl/render.js
function hasGetReader(obj) {
  return typeof obj.getReader === "function";
}
async function* streamAsyncIterator(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        return;
      yield decoder.decode(value);
    }
  } finally {
    reader.releaseLock();
  }
}
async function* handleIterator(iterable) {
  if (hasGetReader(iterable)) {
    for await (const chunk of streamAsyncIterator(iterable)) {
      yield chunk;
    }
  } else {
    for await (const chunk of iterable) {
      yield chunk;
    }
  }
}
async function* handle(chunk, promises) {
  if (typeof chunk === "string") {
    yield chunk;
  } else if (typeof chunk === "function") {
    yield* handle(chunk(), promises);
  } else if (Array.isArray(chunk)) {
    yield* _render(chunk, promises);
  } else if (typeof chunk?.then === "function") {
    const v = await chunk;
    yield* handle(v, promises);
  } else if (chunk instanceof Response && chunk.body) {
    yield* handleIterator(chunk.body);
  } else if (chunk?.[Symbol.asyncIterator] || chunk?.[Symbol.iterator]) {
    yield* _render(chunk, promises);
  } else if (chunk?.fn?.kind === AWAIT_SYMBOL) {
    const { promise, template } = chunk.fn({
      ...chunk.properties.reduce((acc, prop) => ({ ...acc, [prop.name]: prop.value }), {}),
      children: chunk.children
    });
    const id = promises.length;
    promises.push(
      promise().then((data) => ({
        id,
        template: template({ pending: false, error: false, success: true }, data, null)
      })).catch((error) => {
        console.error(error.stack);
        return {
          id,
          template: template({ pending: false, error: true, success: false }, null, error)
        };
      })
    );
    yield* _render(html`<awaiting-promise style="display: contents;" data-id="${id.toString()}">${template({ pending: true, error: false, success: false }, null, null)}</awaiting-promise>`, promises);
  } else if (chunk?.kind === COMPONENT_SYMBOL) {
    yield* handle(
      await chunk.fn({
        ...chunk.properties.reduce((acc, prop) => ({ ...acc, [prop.name]: prop.value }), {}),
        children: chunk.children
      }),
      promises
    );
  } else {
    const stringified = chunk?.toString();
    if (stringified === "[object Object]") {
      yield JSON.stringify(chunk);
    } else {
      yield stringified;
    }
  }
}
async function* _render(template, promises) {
  for await (const chunk of template) {
    yield* handle(chunk, promises);
  }
}
async function* render(template) {
  let promises = [];
  yield* _render(template, promises);
  promises = promises.map((promise) => {
    let p = promise.then((val) => {
      promises.splice(promises.indexOf(p), 1);
      return val;
    });
    return p;
  });
  while (promises.length > 0) {
    const nextPromise = await Promise.race(promises);
    const { id, template: template2 } = nextPromise;
    yield* render(html`
      <template data-id="${id.toString()}">${template2}</template>
      <script>
        {
          let toReplace = document.querySelector('awaiting-promise[data-id="${id.toString()}"]');
          const template = document.querySelector('template[data-id="${id.toString()}"]').content.cloneNode(true);
          toReplace.replaceWith(template);
        }
      </script>
    `);
  }
}
async function renderToString(renderResult) {
  let result = "";
  for await (const chunk of render(renderResult)) {
    result += chunk;
  }
  return result;
}

// node_modules/swtl/router.js
var Router = class {
  constructor({
    routes,
    fallback,
    plugins = [],
    baseHref = ""
  }) {
    this.plugins = plugins;
    this.fallback = {
      render: fallback,
      params: {}
    };
    this.routes = routes.map((route) => ({
      ...route,
      urlPattern: new URLPattern({
        pathname: `${baseHref}${route.path}`,
        search: "*",
        hash: "*"
      })
    }));
  }
  _getPlugins(route) {
    return [
      ...this.plugins ?? [],
      ...route?.plugins ?? []
    ];
  }
  async handleRequest(request) {
    const url = new URL(request.url);
    let matchedRoute;
    for (const route2 of this.routes) {
      const match = route2.urlPattern.exec(url);
      if (match) {
        matchedRoute = {
          render: route2.render,
          params: match?.pathname?.groups ?? {},
          plugins: route2.plugins
        };
        break;
      }
    }
    const route = matchedRoute?.render ?? this?.fallback?.render;
    if (route) {
      const query = Object.fromEntries(new URLSearchParams(new URL(request.url).search));
      const params = matchedRoute?.params;
      const plugins = this._getPlugins(matchedRoute);
      for (const plugin of plugins) {
        try {
          const result = await plugin?.beforeResponse({ query, params, request });
          if (result) {
            return result;
          }
        } catch (e) {
          console.log(`Plugin "${plugin.name}" error on beforeResponse hook`, e);
          throw e;
        }
      }
      return new HtmlResponse(await route({ query, params, request }));
    }
  }
};
var HtmlResponse = class {
  constructor(template) {
    const iterator = render(template);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await iterator.next();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(encoder.encode(value));
          }
        } catch (e) {
          console.error(e.stack);
          throw e;
        }
      }
    });
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Transfer-Encoding": "chunked"
      }
    });
  }
};

// node_modules/swtl/strategies.js
function NetworkFirst({ file, children }) {
  return fetch(file).catch(() => caches.match(file).then((r) => r || children));
}
function CacheFirst({ file, children }) {
  return caches.match(file).then((r) => r || fetch(file).catch(() => children));
}
function CacheOnly({ file, children }) {
  return caches.match(file).then((r) => r || children);
}
function NetworkOnly({ file, children }) {
  return fetch(file).catch(() => children);
}

// .netlify/edge-functions/.vendor/bundled-swtl.js
var bundled_swtl_default = void 0;
export {
  Await,
  CacheFirst,
  CacheOnly,
  HtmlResponse,
  NetworkFirst,
  NetworkOnly,
  Router,
  bundled_swtl_default as default,
  html,
  render,
  renderToString,
  when
};
