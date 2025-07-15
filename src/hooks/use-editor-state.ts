
import { useState, useRef, useEffect } from "react";

export interface EditorState {
  content: string;
  htmlContent: string;
  selection: {
    start: number;
    end: number;
  };
  lastAction: string | null;
}

export function useEditorState(initialContent: string = "") {
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    htmlContent: initialContent || '<p>Start writing your content here...</p>',
    selection: {
      start: 0,
      end: 0,
    },
    lastAction: null,
  });

  const editorRef = useRef<HTMLDivElement | null>(null);

  const updateContent = (content: string) => {
    setState((prev) => ({
      ...prev,
      content,
      lastAction: "update-content",
    }));
  };

  const updateHtmlContent = (htmlContent: string) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    setState((prev) => ({
      ...prev,
      htmlContent,
      content: textContent,
      lastAction: "update-html",
    }));
  };

  const updateSelection = (start: number, end: number) => {
    setState((prev) => ({
      ...prev,
      selection: { start, end },
      lastAction: "update-selection",
    }));
  };

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return false;
    
    editorRef.current.focus();
    
    // Save current selection
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    console.log(`Executing command: ${command}`, value);
    
    const success = document.execCommand(command, false, value);
    
    // Restore selection if command changed it
    if (range && selection) {
      try {
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        console.log("Could not restore selection:", e);
      }
    }
    
    // Update content after command
    setTimeout(() => {
      if (editorRef.current) {
        const newHtml = editorRef.current.innerHTML;
        console.log("Content after command:", newHtml);
        updateHtmlContent(newHtml);
      }
    }, 10);
    
    return success;
  };

  const applyFormat = (format: string, value?: string) => {
    if (!editorRef.current) return;

    console.log(`Applying format: ${format}`, value);
    
    let success = false;
    
    switch (format) {
      case "bold":
        success = execCommand("bold");
        break;
      case "italic":
        success = execCommand("italic");
        break;
      case "underline":
        success = execCommand("underline");
        break;
      case "strikethrough":
        success = execCommand("strikeThrough");
        break;
      case "h1":
        success = execCommand("formatBlock", "h1");
        break;
      case "h2":
        success = execCommand("formatBlock", "h2");
        break;
      case "h3":
        success = execCommand("formatBlock", "h3");
        break;
      case "h4":
        success = execCommand("formatBlock", "h4");
        break;
      case "h5":
        success = execCommand("formatBlock", "h5");
        break;
      case "h6":
        success = execCommand("formatBlock", "h6");
        break;
      case "align-left":
        success = execCommand("justifyLeft");
        break;
      case "align-center":
        success = execCommand("justifyCenter");
        break;
      case "align-right":
        success = execCommand("justifyRight");
        break;
      case "ordered-list":
        success = execCommand("insertOrderedList");
        break;
      case "unordered-list":
        success = execCommand("insertUnorderedList");
        break;
      case "blockquote":
        success = execCommand("formatBlock", "blockquote");
        break;
      case "color":
        if (value) {
          success = execCommand("foreColor", value);
        }
        break;
      case "background":
        if (value) {
          success = execCommand("hiliteColor", value);
        }
        break;
      case "code":
        success = execCommand("formatBlock", "pre");
        break;
    }

    console.log(`Format ${format} applied:`, success);
  };

  const insertHTML = (html: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    const success = execCommand("insertHTML", html);
    console.log("HTML inserted:", success, html);
  };

  const insertImage = (src: string, alt: string = "", align: string = "center") => {
    const alignClass = align === 'left' ? 'float-left mr-4' : 
                       align === 'right' ? 'float-right ml-4' : 
                       'mx-auto block';
    
    const html = `<figure class="${alignClass} my-4">
      <img src="${src}" alt="${alt}" class="max-w-full h-auto rounded" />
      ${alt ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${alt}</figcaption>` : ''}
    </figure>`;
    
    insertHTML(html);
  };

  const insertVideo = (embedUrl: string) => {
    const html = `<div class="aspect-w-16 aspect-h-9 my-4">
      <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded"></iframe>
    </div>`;
    
    insertHTML(html);
  };

  const insertTable = (rows: number, cols: number) => {
    let tableHTML = "<table class='border-collapse w-full my-4'>\n<thead>\n<tr>\n";
    
    for (let i = 0; i < cols; i++) {
      tableHTML += `<th class='border border-gray-300 px-4 py-2'>Header ${i+1}</th>\n`;
    }
    tableHTML += "</tr>\n</thead>\n<tbody>\n";
    
    for (let i = 0; i < rows - 1; i++) {
      tableHTML += "<tr>\n";
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td class='border border-gray-300 px-4 py-2'>Cell ${i+1},${j+1}</td>\n`;
      }
      tableHTML += "</tr>\n";
    }
    
    tableHTML += "</tbody>\n</table>";
    
    insertHTML(tableHTML);
  };

  const insertLink = (url: string, text: string, newTab: boolean) => {
    const html = `<a href="${url}" ${newTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
    insertHTML(html);
  };

  const undo = () => {
    execCommand("undo");
  };

  const redo = () => {
    execCommand("redo");
  };

  return {
    state,
    editorRef,
    updateContent,
    updateHtmlContent,
    updateSelection,
    applyFormat,
    insertHTML,
    insertImage,
    insertVideo,
    insertTable,
    insertLink,
    undo,
    redo,
  };
}
