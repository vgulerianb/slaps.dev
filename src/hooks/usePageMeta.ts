import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  ogImage?: string;
}

function setMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [attrName, ...rest] = selector.replace("meta[", "").replace("]", "").split("=");
    el.setAttribute(attrName.trim(), rest.join("=").replace(/"/g, "").trim());
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export function usePageMeta({ title, description, ogImage }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    if (ogImage) {
      setMeta('meta[property="og:image"]', "content", ogImage);
      setMeta('meta[name="twitter:image"]', "content", ogImage);
    }
  }, [title, description, ogImage]);
}
