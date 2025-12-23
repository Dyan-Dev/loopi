import { BrowserWindow, ipcMain } from "electron";

/**
 * Manages the element selector picking functionality
 * Allows users to click on elements in the browser to capture their CSS selectors
 */
export class SelectorPicker {
  /**
   * Injects a URL navigation bar into the browser window
   * Allows users to navigate to different pages during selector picking
   */
  injectNavigationBar(browserWindow: BrowserWindow): void {
    browserWindow.webContents.on("did-finish-load", () => {
      const navigationBarScript = `
        if (document.getElementById('electron-search-bar')) return;
        
        const bar = document.createElement('div');
        bar.id = 'electron-search-bar';
        bar.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 40px; background: #f8f9fa; z-index: 10000; display: flex; align-items: center; padding: 0 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-bottom: 1px solid #dee2e6;';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter URL (e.g., google.com)';
        input.style.cssText = 'flex: 1; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px 0 0 4px; font-size: 14px; outline: none;';
        input.onkeydown = (e) => { if (e.key === 'Enter') input.parentNode.lastChild.click(); };
        
        const btn = document.createElement('button');
        btn.textContent = 'Go';
        btn.style.cssText = 'padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 0 4px 4px 0; cursor: pointer; font-size: 14px;';
        btn.onclick = () => {
          const url = input.value.trim();
          if (url && window.electronBrowserAPI && window.electronBrowserAPI.navigate) {
            window.electronBrowserAPI.navigate(url);
          }
        };
        
        bar.append(input, btn);
        document.body.prepend(bar);
      `;
      browserWindow.webContents.executeJavaScript(navigationBarScript).catch(console.error);
    });
  }

  /**
   * Initiates the selector picking process
   * @param browserWindow - The browser window to inject the picker into
   * @param timeout - Maximum time to wait for selection (in ms)
   * @returns Promise resolving to the selected CSS selector or null if cancelled/timed out
   */
  async pickSelector(
    browserWindow: BrowserWindow,
    options?: { strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"; dataAttrKeys?: string[] },
    timeout: number = 60000
  ): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeout);

      const cleanup = () => {
        clearTimeout(timeoutId);
        ipcMain.removeListener("selector-picked", onPick);
        ipcMain.removeListener("selector-cancel", onCancel);
      };

      const onPick = (
        _event: Electron.IpcMainEvent,
        payload: string | { selector: string; tagName?: string }
      ) => {
        cleanup();
        const selector = typeof payload === "string" ? payload : payload.selector;
        const tagName = typeof payload === "string" ? undefined : payload.tagName?.toLowerCase();

        // Handle select elements specially to capture option data
        if (tagName === "select") {
          const optionDataScript = `
            (() => {
              let select;
              try {
                // Try CSS first
                select = document.querySelector(${JSON.stringify(selector)});
              } catch {}
              if (!select) {
                try {
                  // Try XPath if CSS failed
                  const result = document.evaluate(${JSON.stringify(
                    selector
                  )}, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                  select = result.singleNodeValue;
                } catch {}
              }
              if (select) {
                return {
                  optionIndex: select.selectedIndex,
                  optionValue: select.value,
                };
              }
              return null;
            })();
          `;
          browserWindow.webContents
            .executeJavaScript(optionDataScript)
            .then((res) => {
              if (res) {
                resolve(`${selector}||${res.optionIndex}||${res.optionValue}`);
              } else {
                resolve(selector);
              }
            })
            .catch((err) => {
              console.error("Failed to get select option data:", err);
              resolve(selector);
            });
          return;
        }

        resolve(selector);
      };

      const onCancel = () => {
        cleanup();
        resolve(null);
      };

      ipcMain.once("selector-picked", onPick);
      ipcMain.once("selector-cancel", onCancel);

      // injectPickerScript returns a promise; handle errors without using async executor
      this.injectPickerScript(browserWindow, options).catch((err) => {
        console.error("Failed to inject picker script:", err);
        cleanup();
        resolve(null);
      });
    });
  }

  /**
   * Injects the interactive selector picker UI into the page
   * Users can hover to highlight elements and click to select them
   */
  private async injectPickerScript(
    browserWindow: BrowserWindow,
    options?: { strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"; dataAttrKeys?: string[] }
  ): Promise<void> {
    const opts = options || {};
    const pickerScript = `
      (function() {
        try {
          var __opts = ${JSON.stringify({ strategy: opts.strategy || "css", dataAttrKeys: opts.dataAttrKeys || ["data-testid", "data-test", "data-qa", "data-testId", "data-cy", "data-test-id"] })};
          function getUniqueSelector(parent, el) {
            if (!parent || !el) return el.tagName.toLowerCase();
            var tag = el.tagName.toLowerCase();
            
            if (tag === 'body') return 'body';
            
            if (parent.querySelector(tag) === el) return tag;
            
            var nthType = 1;
            var sib = el.previousElementSibling;
            while (sib) {
              if (sib.tagName === el.tagName) nthType++;
              sib = sib.previousElementSibling;
            }
            
            var nthTypeSel = tag + (nthType === 1 ? ':first-of-type' : ':nth-of-type(' + nthType + ')');
            
            if (parent.querySelector(nthTypeSel) === el) return nthTypeSel;
            return nthTypeSel;
          }

          function generateCSSSelector(el) {
            if (!el || el.nodeType !== 1) return '';
            var parts = [];
            var current = el;
            
            while (current.parentElement && current.parentElement.nodeType === 1) {
              var rel = getUniqueSelector(current.parentElement, current);
              parts.unshift(rel);
              current = current.parentElement;
            }
            
            parts.unshift('html');
            return parts.join(' > ');
          }

          function generateXPath(el) {
            if (!el || el.nodeType !== 1) return '';
            if (el.id) {
              return '//*[@id="' + el.id.replace(/"/g, '\\"') + '"]';
            }
            var parts = [];
            for (; el && el.nodeType === 1; el = el.parentNode) {
              var index = 1;
              var sib = el.previousSibling;
              for (; sib; sib = sib.previousSibling) {
                if (sib.nodeType === 1 && sib.nodeName === el.nodeName) index++;
              }
              parts.unshift(el.nodeName.toLowerCase() + '[' + index + ']');
            }
            return '//' + parts.join('/');
          }

          function generateDataAttrSelector(el, keys) {
            var current = el;
            while (current && current.nodeType === 1) {
              for (var i=0;i<keys.length;i++) {
                var key = keys[i];
                var val = current.getAttribute && current.getAttribute(key);
                if (val) {
                  var selector = '[' + key + '="' + String(val).replace(/"/g, '\\"') + '"]';
                  try {
                    if (document.querySelectorAll(selector).length === 1) return selector;
                  } catch (e) {}
                  return selector;
                }
              }
              current = current.parentElement;
            }
            return generateCSSSelector(el);
          }

          function generateAriaSelector(el) {
            if (!el || el.nodeType !== 1) return '';
            var ariaLabel = el.getAttribute && el.getAttribute('aria-label');
            if (ariaLabel) {
              var sel = '[aria-label="' + String(ariaLabel).replace(/"/g, '\\"') + '"]';
              try { if (document.querySelectorAll(sel).length === 1) return sel; } catch(e) {}
              return sel;
            }
            var role = el.getAttribute && el.getAttribute('role');
            if (role) {
              return '[role="' + String(role).replace(/"/g, '\\"') + '"]';
            }
            return generateCSSSelector(el);
          }

          function generateIdSelector(el) {
            if (el && el.id) return '#' + el.id;
            return generateCSSSelector(el);
          }

          function chooseSelector(el) {
            var strategy = (__opts.strategy || 'css');
            if (strategy === 'css') return generateCSSSelector(el);
            if (strategy === 'xpath') return generateXPath(el);
            if (strategy === 'dataAttr') return generateDataAttrSelector(el, __opts.dataAttrKeys || []);
            if (strategy === 'aria') return generateAriaSelector(el);
            if (strategy === 'id') return generateIdSelector(el);
            return generateCSSSelector(el);
          }

          var style = document.createElement('style');
          style.id = 'picker-style';
          style.textContent = '* { transition: outline 0.2s ease !important; } .picker-highlight { outline: 3px solid #ff0000 !important; background: rgba(255, 0, 0, 0.1) !important; z-index: 999999 !important; } #picker-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999998; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-family: sans-serif; pointer-events: none; }';
          document.head.appendChild(style);

          var overlay = document.createElement('div');
          overlay.id = 'picker-overlay';
          overlay.textContent = 'Click to select (' + (__opts.strategy || 'css') + '). Press Escape to cancel.';
          document.body.appendChild(overlay);

          function handleMouseOver(e) {
            e.target.classList.add('picker-highlight');
          }
          
          function handleMouseOut(e) {
            e.target.classList.remove('picker-highlight');
          }
          
          document.addEventListener('mouseover', handleMouseOver, true);
          document.addEventListener('mouseout', handleMouseOut, true);

          function handleClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var el = e.target;
            el.classList.remove('picker-highlight');
            var selectorString = chooseSelector(el);
            
            cleanup();
            
            if (window.electronAPI && window.electronAPI.sendSelector) {
              try {
                window.electronAPI.sendSelector({ selector: selectorString, tagName: el.tagName.toLowerCase() });
              } catch (e) {
                // fallback to raw string
                window.electronAPI.sendSelector(selectorString);
              }
            }
          }
          
          document.addEventListener('click', handleClick, true);

          function handleKeydown(e) {
            if (e.key === 'Escape') {
              cleanup();
              if (window.electronAPI && window.electronAPI.cancelSelector) {
                window.electronAPI.cancelSelector();
              }
            }
          }
          
          document.addEventListener('keydown', handleKeydown, true);

          function cleanup() {
            var styleEl = document.getElementById('picker-style');
            if (styleEl) styleEl.remove();
            
            var overlayEl = document.getElementById('picker-overlay');
            if (overlayEl) overlayEl.remove();
            
            var highlighted = document.querySelectorAll('.picker-highlight');
            for (var i = 0; i < highlighted.length; i++) {
              highlighted[i].classList.remove('picker-highlight');
            }
            
            document.removeEventListener('mouseover', handleMouseOver, true);
            document.removeEventListener('mouseout', handleMouseOut, true);
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleKeydown, true);
          }
        } catch (err) {
          console.error('Picker script error:', err);
        }
      })();
    `;

    await browserWindow.webContents.executeJavaScript(pickerScript);
  }
}
