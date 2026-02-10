import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import pluginFilters from "./_config/filters.js";

//replaced requires with imports
import striptags from "striptags";
import markdownIt from "markdown-it";

//dynamic categories plugin from bryan robinson
import dynamicCategories from "eleventy-plugin-dynamic-categories";

//pdf embed plugin from raymondcamden
import pluginPDFembed from "eleventy-plugin-pdfembed";

//Ensure urls are converted to use site base (for images, navigation, etc.)
import metadata from "./_data/metadata.js";
const toAbsoluteUrl = (url) => {
	return new URL (url, metadata.devUrl).href;
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/"
		})
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl")
		.addPassthroughCopy("js")
		.addPassthroughCopy("./assets/images/about/volunteers")
		.addPassthroughCopy("./assets/fonts")
		.addPassthroughCopy("./assets/images/UXBYDLHLogo.svg")
		.addPassthroughCopy("./_data/tools.json")
		.addPassthroughCopy("./assets/images/3rd-party-logos/tools")
		.addPassthroughCopy({
			'./node_modules/alpinejs/dist/cdn.js': './js/alpine.js',
		}) //Alpine

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch CSS files
	eleventyConfig.addWatchTarget("css/**/*.css");
	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Bundle <style> content and adds a {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
		// Add all <style> content to `css` bundle (use <style eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "style",
	});

	// Bundle <script> content and adds a {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
		// Add all <script> content to the `js` bundle (use <script eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "script",
	});

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			//eleventyNavigation: {
			//	key: "Feed",
			//	order: 4
			//} Temporarily removing post feed from Eleventy Navigation
		},
		collection: {
			name: "posts",
			limit: 10,
		},
		metadata: {
			language: "en",
			title: "Give and Grow CIC",
			subtitle: "Accessible tutoring services for students at every level of financing.",
			base: "https://giveandgrowcic.co.uk/",
			author: {
				name: "UXbyDLH"
			}
		}
	});

	//Adding a projects collection
	eleventyConfig.addCollection("projects", function(collection) {
		var projectCollection = collection.getFilteredByTag("project");
		return projectCollection;
	});

	//Adding a case studies collection
	eleventyConfig.addCollection("case-studies", function(collection) { 
		var caseStudyCollection = collection.getFilteredByTag("case-study");
		return caseStudyCollection;
	})

	//Adding a web design collection
	eleventyConfig.addCollection("web-design", function(collection) {
		var webdesignCollection = collection.getFilteredByTag("web-design");
		return webdesignCollection;
	})

	//Adding an images folder
	eleventyConfig.addPassthroughCopy("/assets/images/logo");

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "svg", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			}
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});
	
	//Shortcode for versioning/cache busting(?)
	eleventyConfig.addShortcode('version', function () {
		return String(Date.now());
	});


	//Auto-prefix for absolute URLs
	eleventyConfig.addFilter('toAbsoluteUrl', toAbsoluteUrl);

	//Dynamic categories plugin
	eleventyConfig.addPlugin(dynamicCategories, {
		categoryVar: 'categories',
		itemsCollection: 'news',
		perPageCount: 2
	});

	//PDF embed plugin
	eleventyConfig.addPlugin(pluginPDFembed, {
		key: '2e45665c31ec4cf5b22c18d63cdebf2a'
	});

	//Creating Excerpts ************
	// From https://tylersticka.com/journal/simple-eleventy-3-excerpts/
	//Set Markdown Library
	const md = markdownIt({/*...*/});
	eleventyConfig.setLibrary("md", md);

	//Create computed data per page
	eleventyConfig.addGlobalData("eleventyComputed.excerpt", () => (data) => {
			// If property is explicitly set, use that
			if (data.excerpt) {
				return data.excerpt;
			}

			// Otherwise grab raw page content
			let content = data.page.rawInput;

			// If template uses Markdown, render it
			if (data.page.templateSyntax.includes('md')) {
				content = md.render(content);
			}

			// Vanilla paragraphs ending in period, question or exclamation
			const matches = content.match(/<p>(.+[\.\?\!])<\/p>/);

			// If found, return content
			if (matches) {
				return matches [1];
			}

			//not sure about returning null.
			return null;
		}	
	);
	//END Creating Excerpts ********

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};


