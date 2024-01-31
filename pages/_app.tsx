import React from "react";
import Head from "next/head";
import Link from "next/link";

import { SideNav, TableOfContents, TopNav } from "../components";

import "prismjs";
// Import other Prism themes here
import "prismjs/components/prism-bash.min";
import "prismjs/themes/prism.css";

import "../public/globals.css";

import type { AppProps } from "next/app";
import type { MarkdocNextJsPageProps } from "@markdoc/next.js";

const TITLE = "Markdoc";
const DESCRIPTION = "A powerful, flexible, Markdown-based authoring framework";

function collectHeadings(node, sections = []) {
  if (node) {
    if (node.name === "Heading") {
      const title = node.children[0];

      if (typeof title === "string") {
        sections.push({
          ...node.attributes,
          title
        });
      }
    }

    if (node.children) {
      for (const child of node.children) {
        collectHeadings(child, sections);
      }
    }
  }

  return sections;
}

export type MyAppProps = MarkdocNextJsPageProps;

export default function MyApp({ Component, pageProps }: AppProps<MyAppProps>) {
  const { markdoc } = pageProps;

  let title = TITLE;
  let description = DESCRIPTION;
  if (markdoc) {
    if (markdoc.frontmatter.title) {
      title = markdoc.frontmatter.title;
    }
    if (markdoc.frontmatter.description) {
      description = markdoc.frontmatter.description;
    }
  }

  const toc = pageProps.markdoc?.content ? collectHeadings(pageProps.markdoc.content) : [];

  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragEnd = (event) => {
    setIsDragging(false);
  };
  const handleHide = (event) => {
    const sidenav = document.getElementById("sidenav");
    sidenav.style.width = `0px`;
  };
  const handleDragStart = (event) => {
    setIsDragging(true);
  };
  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) return;
    const sidenav = document.getElementById("sidenav");
    const newWidth = event.screenX;
    sidenav.style.width = `${newWidth}px`;
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="strict-origin" />
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav>
        <Link href="/docs">Docs</Link>
      </TopNav>
      <div className="page" onMouseMove={handleDrag}>
        <SideNav  />
        <div className="slider grab" onMouseDown={handleDragStart} onMouseUp={handleDragEnd}>
          <div className=""  />
        </div>
        <TableOfContents toc={toc} />
        <main className="flex column">
          <Component {...pageProps} />
        </main>
      </div>
      <style jsx>
        {`
          .page {
            position: fixed;
            top: var(--top-nav-height);
            display: flex;
            width: 100vw;
            flex-grow: 1;
          }
          main {
            overflow: auto;
            height: calc(100vh - var(--top-nav-height));
            flex-grow: 1;
            font-size: 16px;
            padding: 0 2rem 2rem;
          }
          .slider{
            width: 7px;
            background: black;
            height: 100%;
            flex: 0 0 auto;
          }
        `}
      </style>
    </>
  );
}

class slider {
  slider: HTMLElement;
  grab: HTMLElement;
  startX: number;
  scrollLeft: number;

  constructor() {
    this.slider = document.querySelector(".slider");
    this.grab = document.querySelector(".grab");
    this.slider.addEventListener("mousedown", this.start.bind(this));
    this.slider.addEventListener("mouseup", this.end.bind(this));
    this.slider.addEventListener("mouseleave", this.end.bind(this));
    this.slider.addEventListener("mousemove", this.move.bind(this));
  }
  start(e: MouseEvent) {
    this.slider.classList.add("active");
    this.startX = e.pageX - this.slider.offsetLeft;
    this.scrollLeft = this.slider.scrollLeft;
  }
  end() {
    this.slider.classList.remove("active");
  }
  move(e: MouseEvent) {
    if (!this.slider.classList.contains("active")) return;
    e.preventDefault();
    const x = e.pageX - this.slider.offsetLeft;
    const walk = (x - this.startX) * 3;
    this.slider.scrollLeft = this.scrollLeft - walk;
  }
}
