import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region user-guide/cloud-storage.md
var __pageData = JSON.parse("{\"title\":\"Cloud Storage\",\"description\":\"Keep documents and component libraries in your own S3-compatible bucket — AWS S3, Backblaze B2, Cloudflare R2, MinIO, and others.\",\"frontmatter\":{\"title\":\"Cloud Storage\",\"description\":\"Keep documents and component libraries in your own S3-compatible bucket — AWS S3, Backblaze B2, Cloudflare R2, MinIO, and others.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/user-guide/cloud-storage\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/user-guide/cloud-storage\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/user-guide/cloud-storage\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/user-guide/cloud-storage\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Cloud Storage — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Cloud Storage — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Keep documents and component libraries in your own S3-compatible bucket — AWS S3, Backblaze B2, Cloudflare R2, MinIO, and others.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Keep documents and component libraries in your own S3-compatible bucket — AWS S3, Backblaze B2, Cloudflare R2, MinIO, and others.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Keep documents and component libraries in your own S3-compatible bucket — AWS S3, Backblaze B2, Cloudflare R2, MinIO, and others.\"}]]},\"headers\":[],\"relativePath\":\"user-guide/cloud-storage.md\",\"filePath\":\"user-guide/cloud-storage.md\",\"lastUpdated\":1791501667000}");
var _sfc_main = { name: "user-guide/cloud-storage.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="cloud-storage" tabindex="-1">Cloud Storage <a class="header-anchor" href="#cloud-storage" aria-label="Permalink to “Cloud Storage”">​</a></h1><p>OpenPencil can keep documents in a bucket you own on any S3-compatible service: AWS S3, Backblaze B2, Cloudflare R2, MinIO, and others. There is no OpenPencil server in between; the editor talks to your bucket directly with your own access keys.</p><h2 id="connect-a-bucket" tabindex="-1">Connect a Bucket <a class="header-anchor" href="#connect-a-bucket" aria-label="Permalink to “Connect a Bucket”">​</a></h2><p>Open <strong>Settings → Cloud storage</strong>, select <strong>S3 storage</strong>, and fill in:</p><table tabindex="0"><thead><tr><th>Field</th><th>What to enter</th></tr></thead><tbody><tr><td><strong>Endpoint</strong></td><td>The provider&#39;s S3 API URL, including any required path. See the examples below.</td></tr><tr><td><strong>Bucket</strong></td><td>The bucket name.</td></tr><tr><td><strong>Region</strong></td><td>Optional. Left empty, it is read from the endpoint, or <code>us-east-1</code> when it can&#39;t be.</td></tr><tr><td><strong>Access key ID</strong></td><td>An access key with read, write, list, and delete access to the bucket.</td></tr><tr><td><strong>Secret access key</strong></td><td>The key&#39;s secret.</td></tr></tbody></table><p>Endpoint examples:</p><ul><li>AWS S3: <code>https://s3.eu-west-1.amazonaws.com</code></li><li>Backblaze B2: <code>https://s3.eu-central-003.backblazeb2.com</code></li><li>Cloudflare R2: <code>https://&lt;account-id&gt;.r2.cloudflarestorage.com</code></li><li>MinIO: <code>http://localhost:9000</code>, or wherever your server listens</li></ul><p>Select <strong>Test connection</strong> to check the endpoint, keys, and bucket before saving, then <strong>Save</strong>. OpenPencil addresses objects as <code>{endpoint}/{bucket}/{key}</code>, so the bucket name never goes into the endpoint.</p><p>Access keys are kept in the system credential store in the desktop app. In the browser they are encrypted in browser storage, or kept only until you close the session when <strong>Settings → General → Remember API keys on this device</strong> is off.</p><h2 id="allow-the-web-app-in-cors" tabindex="-1">Allow the Web App in CORS <a class="header-anchor" href="#allow-the-web-app-in-cors" aria-label="Permalink to “Allow the Web App in CORS”">​</a></h2><p>The browser can only reach a bucket that allows requests from the page&#39;s origin, so the web app needs a CORS rule on the bucket. The desktop app sends its requests natively and needs none.</p><p>Add a rule like this one, with the origins you open OpenPencil from:</p><div class="language-json"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;AllowedHeaders&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;*&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;AllowedMethods&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;GET&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PUT&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;POST&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;DELETE&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;HEAD&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;AllowedOrigins&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;https://app.openpencil.dev&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;ExposeHeaders&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ETag&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Content-Range&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;x-amz-request-id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;x-amz-id-2&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;x-amz-version-id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;MaxAgeSeconds&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3600</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span></code></pre></div><p>Set it in the AWS console under the bucket&#39;s <strong>Permissions → Cross-origin resource sharing</strong>, in the Cloudflare dashboard under the R2 bucket&#39;s <strong>Settings → CORS policy</strong>, or with your provider&#39;s CLI. When the rule is missing, <strong>Test connection</strong> says the browser could not reach the bucket from the current site.</p><h2 id="save-a-document-to-storage" tabindex="-1">Save a Document to Storage <a class="header-anchor" href="#save-a-document-to-storage" aria-label="Permalink to “Save a Document to Storage”">​</a></h2><p>Open or create a document, then choose <strong>File → Save to storage…</strong>. The document is saved into the bucket and the tab stays bound to it: <strong>Save</strong> and auto-save now write to storage instead of a local file. A local <code>.fig</code> you had open keeps its last saved contents.</p><p>To open stored documents, choose <strong>File → Open storage workspace…</strong>. The workspace lists every document in the bucket with a preview read from the document itself, so listing a large file downloads only its embedded thumbnail.</p><h2 id="how-saving-works" tabindex="-1">How Saving Works <a class="header-anchor" href="#how-saving-works" aria-label="Permalink to “How Saving Works”">​</a></h2><p>Saving writes the document on this device first and uploads it in the background, so editing never waits for the network. If an upload fails or you are offline, it is retried with increasing delays, and pending work resumes when you reconnect or change storage settings.</p><p>Each document is uploaded whole. When two devices save the same document, the last upload wins.</p><p>Documents you have opened stay cached on the device for faster reopening, up to 500 MB. Only copies that are fully uploaded are removed when the cache is full, and they are downloaded again the next time you open them.</p><h2 id="component-libraries" tabindex="-1">Component Libraries <a class="header-anchor" href="#component-libraries" aria-label="Permalink to “Component Libraries”">​</a></h2><p>The bucket can also hold component libraries. In <strong>Assets → Manage libraries</strong>, switch the source to <strong>Storage</strong> to publish and enable libraries there instead of on this device. Publishing uses conditional writes, so two people publishing the same library at once can&#39;t overwrite each other&#39;s revision. See <a href="./components#component-libraries">Components</a> for publishing and updating libraries.</p><h2 id="what-s-in-the-bucket" tabindex="-1">What&#39;s in the Bucket <a class="header-anchor" href="#what-s-in-the-bucket" aria-label="Permalink to “What&#39;s in the Bucket”">​</a></h2><p>OpenPencil writes only under two prefixes and leaves everything else in the bucket alone:</p><ul><li><code>open_pencil_storage/canvases/</code> — each document as <code>&lt;id&gt;.fig</code>, with its name and modification time in <code>&lt;id&gt;.meta.json</code>.</li><li><code>open-pencil/libraries/</code> — each library&#39;s <code>manifest.json</code> and its published revisions.</li></ul><h2 id="provider-notes" tabindex="-1">Provider Notes <a class="header-anchor" href="#provider-notes" aria-label="Permalink to “Provider Notes”">​</a></h2><ul><li><strong>Cloudflare R2</strong> needs the exact web app origin in its CORS rule; it does not accept wildcard origins such as <code>https://*.example.com</code>.</li><li><strong>MinIO</strong> answers CORS requests from any origin unless you configure otherwise.</li><li><strong><code>rclone serve s3</code></strong> works with two limits. It rejects CORS preflight requests, so the web app needs a reverse proxy in front of it that answers them; the desktop app does not. It also ignores conditional writes, so concurrent library publishes are not detected.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("user-guide/cloud-storage.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var cloud_storage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, cloud_storage_default as default };
