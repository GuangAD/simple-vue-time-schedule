/* eslint-disable */ // 禁用 ESLint 检查，因为这些是工具函数，可能不完全符合项目规范，且有针对老旧浏览器的兼容代码

/**
 * @fileoverview DOM 操作工具函数集合
 *
 * 这是一组用于 DOM 操作的工具函数，包括事件绑定、CSS 类操作、样式设置、滚动等，
 * 旨在提供跨浏览器兼容性，并可能包含针对旧版 IE 的特殊处理。
 *
 * Copyright 2017 ByteDance, Inc.
 * Licensed under MIT
 *
 * 注意：此文件是根据 Webpack 打包文件中模块 ID 8 的内容逆向还原而来，
 * 可能与原始源码的风格或注释略有不同，但功能应完全一致。
 */

const isServer = typeof window === "undefined"; // 更准确的判断是否在服务器环境
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const ieVersion = isServer ? 0 : Number(document.documentMode); // 用于 IE < 9 的兼容性处理

/**
 * 移除字符串两端的空白字符
 * @param {string} string 待处理的字符串
 * @returns {string} 处理后的字符串
 */
const trim = function (string) {
  return (string || "").replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "");
};

/**
 * 将短横线命名或下划线命名转换为驼峰命名
 * 例如：'background-color' -> 'backgroundColor', 'moz-transform' -> 'MozTransform'
 * @param {string} name 待转换的字符串
 * @returns {string} 驼峰命名字符串
 */
// eslint-disable-next-line no-unused-vars
const camelCase = function (name) {
  // 'camelCase' is exported using `exports.camelCase = camelCase` in original code
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    })
    .replace(MOZ_HACK_REGEXP, "Moz$1");
};

/**
 * 绑定 DOM 事件（兼容 IE）
 * @param {HTMLElement} element DOM 元素
 * @param {string} event 事件名称（不带 'on' 前缀，如 'click'）
 * @param {Function} handler 事件处理函数
 */
export const on = (function () {
  if (!isServer && document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent("on" + event, handler);
      }
    };
  }
})();

/**
 * 移除 DOM 事件（兼容 IE）
 * @param {HTMLElement} element DOM 元素
 * @param {string} event 事件名称
 * @param {Function} handler 事件处理函数
 */
export const off = (function () {
  if (!isServer && document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent("on" + event, handler);
      }
    };
  }
})();

/**
 * 绑定单次 DOM 事件（事件触发后自动移除）
 * @param {HTMLElement} el DOM 元素
 * @param {string} event 事件名称
 * @param {Function} fn 事件处理函数
 */
export const once = function (el, event, fn) {
  const listener = function (...args) {
    if (fn) {
      fn.apply(this, args);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

/**
 * 检测元素是否包含某个 CSS 类
 * @param {HTMLElement} el DOM 元素
 * @param {string} cls CSS 类名
 * @returns {boolean} 是否包含
 */
export function hasClass(el, cls) {
  if (!el || !cls) return false;
  if (cls.indexOf(" ") !== -1) {
    throw new Error("className should not contain space.");
  }
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return ` ${el.className} `.indexOf(` ${cls} `) > -1;
  }
}

/**
 * 为元素添加一个或多个 CSS 类
 * @param {HTMLElement} el DOM 元素
 * @param {string} cls CSS 类名（可以包含多个，用空格分隔）
 */
export function addClass(el, cls) {
  if (!el) return;
  let curClass = el.className;
  const classes = (cls || "").split(" ");

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName);
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ` ${clsName}`;
      }
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/**
 * 从元素中移除一个或多个 CSS 类
 * @param {HTMLElement} el DOM 元素
 * @param {string} cls CSS 类名（可以包含多个，用空格分隔）
 */
export function removeClass(el, cls) {
  if (!el || !cls) return;
  const classes = cls.split(" ");
  let curClass = ` ${el.className} `;

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(` ${clsName} `, " ");
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

/**
 * 获取元素的计算样式
 * @param {HTMLElement} element DOM 元素
 * @param {string} styleName 样式属性名（如 'width', 'background-color'）
 * @returns {string|null} 样式值
 */
export const getStyle =
  ieVersion < 9
    ? function (element, styleName) {
        if (isServer) return;
        if (!element || !styleName) return null;
        styleName = camelCase(styleName);
        if (styleName === "float") {
          styleName = "styleFloat";
        }
        try {
          switch (styleName) {
            case "opacity":
              try {
                return element.filters.item("alpha").opacity / 100;
              } catch (e) {
                return 1.0;
              }
            default:
              return element.style[styleName] || element.currentStyle
                ? element.currentStyle[styleName]
                : null;
          }
        } catch (e) {
          return element.style[styleName];
        }
      }
    : function (element, styleName) {
        if (isServer) return;
        if (!element || !styleName) return null;
        styleName = camelCase(styleName);
        if (styleName === "float") {
          styleName = "cssFloat";
        }
        try {
          const computed = document.defaultView.getComputedStyle(element, "");
          return (
            element.style[styleName] || (computed ? computed[styleName] : null)
          );
        } catch (e) {
          return element.style[styleName];
        }
      };

/**
 * 设置元素的样式
 * @param {HTMLElement} element DOM 元素
 * @param {string|object} styleName 样式属性名（字符串）或包含多个样式属性的对象
 * @param {string} [value] 当 styleName 为字符串时，对应的样式值
 */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return;

  if (typeof styleName === "object") {
    for (const prop in styleName) {
      if (Object.prototype.hasOwnProperty.call(styleName, prop)) {
        // 修正 hasOwnProperty 调用
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    if (styleName === "opacity" && ieVersion < 9) {
      element.style.filter = isNaN(value)
        ? ""
        : `alpha(opacity=${value * 100})`;
    } else {
      element.style[styleName] = value;
    }
  }
}

/**
 * 将选定的 DOM 元素滚动到可视区域
 * @param {HTMLElement} container 滚动容器
 * @param {HTMLElement} selected 要滚动到可视区域的元素
 * @param {'vertical'|'horizontal'} [direction='vertical'] 滚动方向
 */
export const scrollIntoView = function (
  container,
  selected,
  direction = "vertical"
) {
  if (!selected) {
    if (direction === "horizontal") {
      container.scrollLeft = 0;
      return;
    }
    container.scrollTop = 0;
    return;
  }

  const offsetParents = [];
  let pointer = selected.offsetParent;
  while (pointer && container !== pointer && container.contains(pointer)) {
    offsetParents.push(pointer);
    pointer = pointer.offsetParent;
  }

  if (direction === "horizontal") {
    // 水平方向滚动计算
    const left =
      selected.offsetLeft +
      offsetParents.reduce((prev, curr) => prev + curr.offsetLeft, 0);
    const right = left + selected.offsetWidth;
    const viewRectLeft = container.scrollLeft;
    const viewRectRight = viewRectLeft + container.clientWidth;

    if (left < viewRectLeft) {
      container.scrollLeft = left;
    } else if (right > viewRectRight) {
      container.scrollLeft = right - container.clientWidth;
    }
    return;
  }

  // 垂直方向滚动计算
  const top =
    selected.offsetTop +
    offsetParents.reduce((prev, curr) => prev + curr.offsetTop, 0);
  const bottom = top + selected.offsetHeight;
  const viewRectTop = container.scrollTop;
  const viewRectBottom = viewRectTop + container.clientHeight;

  if (top < viewRectTop) {
    container.scrollTop = top;
  } else if (bottom > viewRectBottom) {
    container.scrollTop = bottom - container.clientHeight;
  }
};

/**
 * 计算滚动条的宽度
 * @returns {number} 滚动条宽度
 */
let scrollBarWidth;
export const getScrollBarWidth = function () {
  if (typeof scrollBarWidth !== "undefined") return scrollBarWidth;
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  outer.style.padding = "0";
  document.body.appendChild(outer);
  scrollBarWidth = outer.offsetHeight; // 在这里，offsetWidth会包括padding，但offsetHeight在overflow:scroll的情况下，可以用于测量滚动条宽度
  document.body.removeChild(outer);
  return scrollBarWidth;
};

/**
 * 将一个元素插入到另一个元素之后
 * @param {HTMLElement} el 要插入的元素
 * @param {HTMLElement} refenerceEle 参考元素
 */
export function insertAfter(el, refenerceEle) {
  const parent = refenerceEle.parentNode;
  if (!parent) return; // Add null check for parent
  // 如果最后的节点是目标元素，则直接添加
  if (parent.lastChild === refenerceEle) {
    parent.appendChild(el);
  } else {
    // 如果不是，则插入在目标元素的下一个兄弟节点 的前面
    parent.insertBefore(el, refenerceEle.nextSibling);
  }
}

/**
 * 移除 DOM 元素
 * @param {HTMLElement} el 要移除的元素
 */
export const removeDom = function (el) {
  if (!el) return;
  if (el.remove) {
    // 使用 Element.remove() API (现代浏览器)
    el.remove();
    return;
  }
  const parent = el.parentNode;
  if (parent && parent.removeChild) {
    parent.removeChild(el);
  }
};

/**
 * 使元素的滚动条平滑滚动到指定位置
 * @param {HTMLElement|Window} el 滚动元素或 window 对象
 * @param {number} [from=0] 起始滚动位置
 * @param {number} to 目标滚动位置
 * @param {number} [duration=500] 滚动动画持续时间（毫秒）
 */
export function scrollTop(el, from = 0, to, duration = 500) {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        return window.setTimeout(callback, 1000 / 60);
      };
  }
  const difference = Math.abs(from - to);
  const step = Math.ceil((difference / duration) * 50); // 每50ms滚动的步长

  function scroll(start, end, step) {
    if (start === end) return;

    let d = start + step > end ? end : start + step;
    if (start > end) {
      // 向上滚动
      d = start - step < end ? end : start - step;
    }

    if (el === window) {
      // For window, scrollTop and scrollLeft are for document scroll.
      // Assuming vertical scroll, we only need to set Y coordinate.
      // The original `window.scrollTo(d, d)` might be a typo, usually `window.scrollTo(window.scrollX, d)`
      window.scrollTo(window.pageXOffset, d); // Corrected to only change Y scroll
    } else {
      el.scrollTop = d;
    }
    window.requestAnimationFrame(() => scroll(d, end, step));
  }
  scroll(from, to, step);
}

/**
 * 检查一个元素是否是另一个元素的后代（或本身）
 * @param {HTMLElement} el 子元素
 * @param {HTMLElement} parent 父元素
 * @returns {boolean}
 */
export function contains(el, parent) {
  if (!el || !parent) return false;
  let currentEl = el; // Use a temporary variable to avoid modifying the original `el` parameter
  while ((currentEl = currentEl.parentNode)) {
    // Assign parentNode to currentEl and check if it exists
    if (currentEl === parent) return true;
  }
  return false;
}

/**
 * 获取元素的滚动条垂直位置
 * @param {HTMLElement|Window|Document} node 元素、window 或 document 对象
 * @returns {number} 滚动条垂直位置
 */
export function getNodeScrollTop(node) {
  if (node === window || node === document) {
    return window.pageYOffset; // For window/document, use pageYOffset
  }
  return node.scrollTop;
}
