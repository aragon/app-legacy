import{da as Ar,gz as qr,d2 as Ur,gA as $r,gB as Pr,gC as Dr,d8 as Hr,gD as jr,gE as Wr,gF as Br,gG as Fr,gH as zr,d9 as Qr,c$ as Vr,cX as Jr,cY as Gr,cZ as Yr,c_ as Kr,dc as At}from"./main-1e616d6f.js";import{g as Zr,s as Xr,m as eo,r as to,k as te,I as no,f as ct,J as lt}from"./browser-9096de8d.js";import{H as ro}from"./http-efa116e8.js";import{g as qe,a as qt}from"./osx-ethers-780b73f3.js";import{b as oo}from"./browser-e933942f.js";import"./tiptap-313d156f.js";const Ee="Session currently connected",D="Session currently disconnected",io="Session Rejected",so="Missing JSON RPC response",ao='JSON-RPC success response must include "result" field',co='JSON-RPC error response must include "error" field',lo='JSON RPC request must have valid "method" value',uo='JSON RPC request must have valid "id" value',_o="Missing one of the required parameters: bridge / uri / session",ut="JSON RPC response format is invalid",fo="URI format is invalid",ho="QRCode Modal not provided",_t="User close QRCode Modal",po=["session_request","session_update","exchange_key","connect","disconnect","display_uri","modal_closed","transport_open","transport_close","transport_error"],mo=["wallet_addEthereumChain","wallet_switchEthereumChain","wallet_getPermissions","wallet_requestPermissions","wallet_registerOnboarding","wallet_watchAsset","wallet_scanQRCode"],Ue=["eth_sendTransaction","eth_signTransaction","eth_sign","eth_signTypedData","eth_signTypedData_v1","eth_signTypedData_v2","eth_signTypedData_v3","eth_signTypedData_v4","personal_sign",...mo],Ie="WALLETCONNECT_DEEPLINK_CHOICE",go={1:"mainnet",3:"ropsten",4:"rinkeby",5:"goerli",42:"kovan"};var Ut=$e;$e.strict=$t;$e.loose=Pt;var vo=Object.prototype.toString,yo={"[object Int8Array]":!0,"[object Int16Array]":!0,"[object Int32Array]":!0,"[object Uint8Array]":!0,"[object Uint8ClampedArray]":!0,"[object Uint16Array]":!0,"[object Uint32Array]":!0,"[object Float32Array]":!0,"[object Float64Array]":!0};function $e(t){return $t(t)||Pt(t)}function $t(t){return t instanceof Int8Array||t instanceof Int16Array||t instanceof Int32Array||t instanceof Uint8Array||t instanceof Uint8ClampedArray||t instanceof Uint16Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array}function Pt(t){return yo[vo.call(t)]}const wo=qe(Ut);var bo=Ut.strict,ko=function(e){if(bo(e)){var n=Buffer.from(e.buffer);return e.byteLength!==e.buffer.byteLength&&(n=n.slice(e.byteOffset,e.byteOffset+e.byteLength)),n}else return Buffer.from(e)};const Eo=qe(ko),Pe="hex",De="utf8",Co="binary",So="buffer",xo="array",Io="typed-array",Ro="array-buffer",he="0";function z(t){return new Uint8Array(t)}function He(t,e=!1){const n=t.toString(Pe);return e?ne(n):n}function je(t){return t.toString(De)}function Dt(t){return t.readUIntBE(0,t.length)}function J(t){return Eo(t)}function U(t,e=!1){return He(J(t),e)}function Ht(t){return je(J(t))}function jt(t){return Dt(J(t))}function We(t){return Buffer.from(Q(t),Pe)}function $(t){return z(We(t))}function To(t){return je(We(t))}function Oo(t){return jt($(t))}function Be(t){return Buffer.from(t,De)}function Wt(t){return z(Be(t))}function No(t,e=!1){return He(Be(t),e)}function Mo(t){const e=parseInt(t,10);return Yo(Go(e),"Number can only safely store up to 53 bits"),e}function Lo(t){return $o(Fe(t))}function Ao(t){return ze(Fe(t))}function qo(t,e){return Po(Fe(t),e)}function Uo(t){return`${t}`}function Fe(t){const e=(t>>>0).toString(2);return Ve(e)}function $o(t){return J(ze(t))}function ze(t){return new Uint8Array(Fo(t).map(e=>parseInt(e,2)))}function Po(t,e){return U(ze(t),e)}function Do(t){return!(typeof t!="string"||!new RegExp(/^[01]+$/).test(t)||t.length%8!==0)}function Bt(t,e){return!(typeof t!="string"||!t.match(/^0x[0-9A-Fa-f]*$/)||e&&t.length!==2+2*e)}function pe(t){return Buffer.isBuffer(t)}function Qe(t){return wo.strict(t)&&!pe(t)}function Ft(t){return!Qe(t)&&!pe(t)&&typeof t.byteLength<"u"}function Ho(t){return pe(t)?So:Qe(t)?Io:Ft(t)?Ro:Array.isArray(t)?xo:typeof t}function jo(t){return Do(t)?Co:Bt(t)?Pe:De}function Wo(...t){return Buffer.concat(t)}function zt(...t){let e=[];return t.forEach(n=>e=e.concat(Array.from(n))),new Uint8Array([...e])}function Bo(t,e=8){const n=t%e;return n?(t-n)/e*e+e:t}function Fo(t,e=8){const n=Ve(t).match(new RegExp(`.{${e}}`,"gi"));return Array.from(n||[])}function Ve(t,e=8,n=he){return zo(t,Bo(t.length,e),n)}function zo(t,e,n=he){return Ko(t,e,!0,n)}function Q(t){return t.replace(/^0x/,"")}function ne(t){return t.startsWith("0x")?t:`0x${t}`}function Qo(t){return t=Q(t),t=Ve(t,2),t&&(t=ne(t)),t}function Vo(t){const e=t.startsWith("0x");return t=Q(t),t=t.startsWith(he)?t.substring(1):t,e?ne(t):t}function Jo(t){return typeof t>"u"}function Go(t){return!Jo(t)}function Yo(t,e){if(!t)throw new Error(e)}function Ko(t,e,n,r=he){const o=e-t.length;let i=t;if(o>0){const c=r.repeat(o);i=n?c+t:t+c}return i}function le(t){return J(new Uint8Array(t))}function Zo(t){return Ht(new Uint8Array(t))}function Qt(t,e){return U(new Uint8Array(t),!e)}function Xo(t){return jt(new Uint8Array(t))}function ei(...t){return $(t.map(e=>U(new Uint8Array(e))).join("")).buffer}function Vt(t){return z(t).buffer}function ti(t){return je(t)}function ni(t,e){return He(t,!e)}function ri(t){return Dt(t)}function oi(...t){return Wo(...t)}function ii(t){return Wt(t).buffer}function si(t){return Be(t)}function ai(t,e){return No(t,!e)}function ci(t){return Mo(t)}function li(t){return We(t)}function Jt(t){return $(t).buffer}function ui(t){return To(t)}function _i(t){return Oo(t)}function di(t){return Lo(t)}function fi(t){return Ao(t).buffer}function hi(t){return Uo(t)}function Gt(t,e){return qo(Number(t),!e)}const pi=$r,mi=Pr,gi=Dr,vi=Hr,yi=jr,Yt=Ur,wi=Wr,Kt=Ar,bi=Br,ki=Fr,Ei=zr,me=qr;function ge(t){return Qr(t)}function ve(){const t=ge();return t&&t.os?t.os:void 0}function Zt(){const t=ve();return t?t.toLowerCase().includes("android"):!1}function Xt(){const t=ve();return t?t.toLowerCase().includes("ios")||t.toLowerCase().includes("mac")&&navigator.maxTouchPoints>1:!1}function en(){return ve()?Zt()||Xt():!1}function tn(){const t=ge();return t&&t.name?t.name.toLowerCase()==="node":!1}function nn(){return!tn()&&!!Yt()}const rn=Zr,on=Xr;function Je(t,e){const n=on(e),r=me();r&&r.setItem(t,n)}function Ge(t){let e=null,n=null;const r=me();return r&&(n=r.getItem(t)),e=n&&rn(n),e}function Ye(t){const e=me();e&&e.removeItem(t)}function Re(){return Vr()}function Ci(t){return Qo(t)}function Si(t){return ne(t)}function xi(t){return Q(t)}function Ii(t){return Vo(ne(t))}const sn=eo;function se(){return((e,n)=>{for(n=e="";e++<36;n+=e*51&52?(e^15?8^Math.random()*(e^20?16:4):4).toString(16):"-");return n})()}function Ri(){console.warn("DEPRECATION WARNING: This WalletConnect client library will be deprecated in favor of @walletconnect/client. Please check docs.walletconnect.org to learn more about this migration!")}function an(t,e){let n;const r=go[t];return r&&(n=`https://${r}.infura.io/v3/${e}`),n}function cn(t,e){let n;const r=an(t,e.infuraId);return e.custom&&e.custom[t]?n=e.custom[t]:r&&(n=r),n}function Ti(t,e){const n=encodeURIComponent(t);return e.universalLink?`${e.universalLink}/wc?uri=${n}`:e.deepLink?`${e.deepLink}${e.deepLink.endsWith(":")?"//":"/"}wc?uri=${n}`:""}function Oi(t){const e=t.href.split("?")[0];Je(Ie,Object.assign(Object.assign({},t),{href:e}))}function ln(t,e){return t.filter(n=>n.name.toLowerCase().includes(e.toLowerCase()))[0]}function Ni(t,e){let n=t;return e&&(n=e.map(r=>ln(t,r)).filter(Boolean)),n}function Mi(t,e){return async(...r)=>new Promise((o,i)=>{const c=(l,d)=>{(l===null||typeof l>"u")&&i(l),o(d)};t.apply(e,[...r,c])})}function un(t){const e=t.message||"Failed or Rejected Request";let n=-32e3;if(t&&!t.code)switch(e){case"Parse error":n=-32700;break;case"Invalid request":n=-32600;break;case"Method not found":n=-32601;break;case"Invalid params":n=-32602;break;case"Internal error":n=-32603;break;default:n=-32e3;break}const r={code:n,message:e};return t.data&&(r.data=t.data),r}const _n="https://registry.walletconnect.com";function Li(){return _n+"/api/v2/wallets"}function Ai(){return _n+"/api/v2/dapps"}function dn(t,e="mobile"){var n;return{name:t.name||"",shortName:t.metadata.shortName||"",color:t.metadata.colors.primary||"",logo:(n=t.image_url.sm)!==null&&n!==void 0?n:"",universalLink:t[e].universal||"",deepLink:t[e].native||""}}function qi(t,e="mobile"){return Object.values(t).filter(n=>!!n[e].universal||!!n[e].native).map(n=>dn(n,e))}var Ke={};(function(t){const e=Yr,n=Kr,r=Jr,o=Gr,i=a=>a==null;function c(a){switch(a.arrayFormat){case"index":return u=>(h,_)=>{const v=h.length;return _===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?h:_===null?[...h,[p(u,a),"[",v,"]"].join("")]:[...h,[p(u,a),"[",p(v,a),"]=",p(_,a)].join("")]};case"bracket":return u=>(h,_)=>_===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?h:_===null?[...h,[p(u,a),"[]"].join("")]:[...h,[p(u,a),"[]=",p(_,a)].join("")];case"comma":case"separator":return u=>(h,_)=>_==null||_.length===0?h:h.length===0?[[p(u,a),"=",p(_,a)].join("")]:[[h,p(_,a)].join(a.arrayFormatSeparator)];default:return u=>(h,_)=>_===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?h:_===null?[...h,p(u,a)]:[...h,[p(u,a),"=",p(_,a)].join("")]}}function l(a){let u;switch(a.arrayFormat){case"index":return(h,_,v)=>{if(u=/\[(\d*)\]$/.exec(h),h=h.replace(/\[\d*\]$/,""),!u){v[h]=_;return}v[h]===void 0&&(v[h]={}),v[h][u[1]]=_};case"bracket":return(h,_,v)=>{if(u=/(\[\])$/.exec(h),h=h.replace(/\[\]$/,""),!u){v[h]=_;return}if(v[h]===void 0){v[h]=[_];return}v[h]=[].concat(v[h],_)};case"comma":case"separator":return(h,_,v)=>{const E=typeof _=="string"&&_.includes(a.arrayFormatSeparator),b=typeof _=="string"&&!E&&s(_,a).includes(a.arrayFormatSeparator);_=b?s(_,a):_;const S=E||b?_.split(a.arrayFormatSeparator).map(T=>s(T,a)):_===null?_:s(_,a);v[h]=S};default:return(h,_,v)=>{if(v[h]===void 0){v[h]=_;return}v[h]=[].concat(v[h],_)}}}function d(a){if(typeof a!="string"||a.length!==1)throw new TypeError("arrayFormatSeparator must be single character string")}function p(a,u){return u.encode?u.strict?e(a):encodeURIComponent(a):a}function s(a,u){return u.decode?n(a):a}function w(a){return Array.isArray(a)?a.sort():typeof a=="object"?w(Object.keys(a)).sort((u,h)=>Number(u)-Number(h)).map(u=>a[u]):a}function g(a){const u=a.indexOf("#");return u!==-1&&(a=a.slice(0,u)),a}function m(a){let u="";const h=a.indexOf("#");return h!==-1&&(u=a.slice(h)),u}function k(a){a=g(a);const u=a.indexOf("?");return u===-1?"":a.slice(u+1)}function I(a,u){return u.parseNumbers&&!Number.isNaN(Number(a))&&typeof a=="string"&&a.trim()!==""?a=Number(a):u.parseBooleans&&a!==null&&(a.toLowerCase()==="true"||a.toLowerCase()==="false")&&(a=a.toLowerCase()==="true"),a}function C(a,u){u=Object.assign({decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1},u),d(u.arrayFormatSeparator);const h=l(u),_=Object.create(null);if(typeof a!="string"||(a=a.trim().replace(/^[?#&]/,""),!a))return _;for(const v of a.split("&")){if(v==="")continue;let[E,b]=r(u.decode?v.replace(/\+/g," "):v,"=");b=b===void 0?null:["comma","separator"].includes(u.arrayFormat)?b:s(b,u),h(s(E,u),b,_)}for(const v of Object.keys(_)){const E=_[v];if(typeof E=="object"&&E!==null)for(const b of Object.keys(E))E[b]=I(E[b],u);else _[v]=I(E,u)}return u.sort===!1?_:(u.sort===!0?Object.keys(_).sort():Object.keys(_).sort(u.sort)).reduce((v,E)=>{const b=_[E];return b&&typeof b=="object"&&!Array.isArray(b)?v[E]=w(b):v[E]=b,v},Object.create(null))}t.extract=k,t.parse=C,t.stringify=(a,u)=>{if(!a)return"";u=Object.assign({encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:","},u),d(u.arrayFormatSeparator);const h=b=>u.skipNull&&i(a[b])||u.skipEmptyString&&a[b]==="",_=c(u),v={};for(const b of Object.keys(a))h(b)||(v[b]=a[b]);const E=Object.keys(v);return u.sort!==!1&&E.sort(u.sort),E.map(b=>{const S=a[b];return S===void 0?"":S===null?p(b,u):Array.isArray(S)?S.reduce(_(b),[]).join("&"):p(b,u)+"="+p(S,u)}).filter(b=>b.length>0).join("&")},t.parseUrl=(a,u)=>{u=Object.assign({decode:!0},u);const[h,_]=r(a,"#");return Object.assign({url:h.split("?")[0]||"",query:C(k(a),u)},u&&u.parseFragmentIdentifier&&_?{fragmentIdentifier:s(_,u)}:{})},t.stringifyUrl=(a,u)=>{u=Object.assign({encode:!0,strict:!0},u);const h=g(a.url).split("?")[0]||"",_=t.extract(a.url),v=t.parse(_,{sort:!1}),E=Object.assign(v,a.query);let b=t.stringify(E,u);b&&(b=`?${b}`);let S=m(a.url);return a.fragmentIdentifier&&(S=`#${p(a.fragmentIdentifier,u)}`),`${h}${b}${S}`},t.pick=(a,u,h)=>{h=Object.assign({parseFragmentIdentifier:!0},h);const{url:_,query:v,fragmentIdentifier:E}=t.parseUrl(a,h);return t.stringifyUrl({url:_,query:o(v,u),fragmentIdentifier:E},h)},t.exclude=(a,u,h)=>{const _=Array.isArray(u)?v=>!u.includes(v):(v,E)=>!u(v,E);return t.pick(a,_,h)}})(Ke);function fn(t){const e=t.indexOf("?")!==-1?t.indexOf("?"):void 0;return typeof e<"u"?t.substr(e):""}function hn(t,e){let n=Ze(t);return n=Object.assign(Object.assign({},n),e),t=pn(n),t}function Ze(t){return Ke.parse(t)}function pn(t){return Ke.stringify(t)}function mn(t){return typeof t.bridge<"u"}function gn(t){const e=t.indexOf(":"),n=t.indexOf("?")!==-1?t.indexOf("?"):void 0,r=t.substring(0,e),o=t.substring(e+1,n);function i(w){const g="@",m=w.split(g);return{handshakeTopic:m[0],version:parseInt(m[1],10)}}const c=i(o),l=typeof n<"u"?t.substr(n):"";function d(w){const g=Ze(w);return{key:g.key||"",bridge:g.bridge||""}}const p=d(l);return Object.assign(Object.assign({protocol:r},c),p)}function Ui(t){return t===""||typeof t=="string"&&t.trim()===""}function $i(t){return!(t&&t.length)}function Pi(t){return pe(t)}function Di(t){return Qe(t)}function Hi(t){return Ft(t)}function ji(t){return Ho(t)}function Wi(t){return jo(t)}function Bi(t,e){return Bt(t,e)}function Fi(t){return typeof t.params=="object"}function vn(t){return typeof t.method<"u"}function B(t){return typeof t.result<"u"}function Z(t){return typeof t.error<"u"}function Te(t){return typeof t.event<"u"}function yn(t){return po.includes(t)||t.startsWith("wc_")}function wn(t){return t.method.startsWith("wc_")?!0:!Ue.includes(t.method)}const zi=Object.freeze(Object.defineProperty({__proto__:null,addHexPrefix:Si,appendToQueryString:hn,concatArrayBuffers:ei,concatBuffers:oi,convertArrayBufferToBuffer:le,convertArrayBufferToHex:Qt,convertArrayBufferToNumber:Xo,convertArrayBufferToUtf8:Zo,convertBufferToArrayBuffer:Vt,convertBufferToHex:ni,convertBufferToNumber:ri,convertBufferToUtf8:ti,convertHexToArrayBuffer:Jt,convertHexToBuffer:li,convertHexToNumber:_i,convertHexToUtf8:ui,convertNumberToArrayBuffer:fi,convertNumberToBuffer:di,convertNumberToHex:Gt,convertNumberToUtf8:hi,convertUtf8ToArrayBuffer:ii,convertUtf8ToBuffer:si,convertUtf8ToHex:ai,convertUtf8ToNumber:ci,detectEnv:ge,detectOS:ve,formatIOSMobile:Ti,formatMobileRegistry:qi,formatMobileRegistryEntry:dn,formatQueryString:pn,formatRpcError:un,getClientMeta:Re,getCrypto:ki,getCryptoOrThrow:bi,getDappRegistryUrl:Ai,getDocument:vi,getDocumentOrThrow:gi,getEncoding:Wi,getFromWindow:pi,getFromWindowOrThrow:mi,getInfuraRpcUrl:an,getLocal:Ge,getLocalStorage:me,getLocalStorageOrThrow:Ei,getLocation:Kt,getLocationOrThrow:wi,getMobileLinkRegistry:Ni,getMobileRegistryEntry:ln,getNavigator:Yt,getNavigatorOrThrow:yi,getQueryString:fn,getRpcUrl:cn,getType:ji,getWalletRegistryUrl:Li,isAndroid:Zt,isArrayBuffer:Hi,isBrowser:nn,isBuffer:Pi,isEmptyArray:$i,isEmptyString:Ui,isHexString:Bi,isIOS:Xt,isInternalEvent:Te,isJsonRpcRequest:vn,isJsonRpcResponseError:Z,isJsonRpcResponseSuccess:B,isJsonRpcSubscription:Fi,isMobile:en,isNode:tn,isReservedEvent:yn,isSilentPayload:wn,isTypedArray:Di,isWalletConnectSession:mn,logDeprecationWarning:Ri,parseQueryString:Ze,parseWalletConnectUri:gn,payloadId:sn,promisify:Mi,removeHexLeadingZeros:Ii,removeHexPrefix:xi,removeLocal:Ye,safeJsonParse:rn,safeJsonStringify:on,sanitizeHex:Ci,saveMobileLinkInfo:Oi,setLocal:Je,uuid:se},Symbol.toStringTag,{value:"Module"}));class Qi{constructor(){this._eventEmitters=[],typeof window<"u"&&typeof window.addEventListener<"u"&&(window.addEventListener("online",()=>this.trigger("online")),window.addEventListener("offline",()=>this.trigger("offline")))}on(e,n){this._eventEmitters.push({event:e,callback:n})}trigger(e){let n=[];e&&(n=this._eventEmitters.filter(r=>r.event===e)),n.forEach(r=>{r.callback()})}}const Vi=typeof global.WebSocket<"u"?global.WebSocket:to();class Ji{constructor(e){if(this.opts=e,this._queue=[],this._events=[],this._subscriptions=[],this._protocol=e.protocol,this._version=e.version,this._url="",this._netMonitor=null,this._socket=null,this._nextSocket=null,this._subscriptions=e.subscriptions||[],this._netMonitor=e.netMonitor||new Qi,!e.url||typeof e.url!="string")throw new Error("Missing or invalid WebSocket url");this._url=e.url,this._netMonitor.on("online",()=>this._socketCreate())}set readyState(e){}get readyState(){return this._socket?this._socket.readyState:-1}set connecting(e){}get connecting(){return this.readyState===0}set connected(e){}get connected(){return this.readyState===1}set closing(e){}get closing(){return this.readyState===2}set closed(e){}get closed(){return this.readyState===3}open(){this._socketCreate()}close(){this._socketClose()}send(e,n,r){if(!n||typeof n!="string")throw new Error("Missing or invalid topic field");this._socketSend({topic:n,type:"pub",payload:e,silent:!!r})}subscribe(e){this._socketSend({topic:e,type:"sub",payload:"",silent:!0})}on(e,n){this._events.push({event:e,callback:n})}_socketCreate(){if(this._nextSocket)return;const e=Gi(this._url,this._protocol,this._version);if(this._nextSocket=new Vi(e),!this._nextSocket)throw new Error("Failed to create socket");this._nextSocket.onmessage=n=>this._socketReceive(n),this._nextSocket.onopen=()=>this._socketOpen(),this._nextSocket.onerror=n=>this._socketError(n),this._nextSocket.onclose=()=>{setTimeout(()=>{this._nextSocket=null,this._socketCreate()},1e3)}}_socketOpen(){this._socketClose(),this._socket=this._nextSocket,this._nextSocket=null,this._queueSubscriptions(),this._pushQueue()}_socketClose(){this._socket&&(this._socket.onclose=()=>{},this._socket.close())}_socketSend(e){const n=JSON.stringify(e);this._socket&&this._socket.readyState===1?this._socket.send(n):(this._setToQueue(e),this._socketCreate())}async _socketReceive(e){let n;try{n=JSON.parse(e.data)}catch{return}if(this._socketSend({topic:n.topic,type:"ack",payload:"",silent:!0}),this._socket&&this._socket.readyState===1){const r=this._events.filter(o=>o.event==="message");r&&r.length&&r.forEach(o=>o.callback(n))}}_socketError(e){const n=this._events.filter(r=>r.event==="error");n&&n.length&&n.forEach(r=>r.callback(e))}_queueSubscriptions(){this._subscriptions.forEach(n=>this._queue.push({topic:n,type:"sub",payload:"",silent:!0})),this._subscriptions=this.opts.subscriptions||[]}_setToQueue(e){this._queue.push(e)}_pushQueue(){this._queue.forEach(n=>this._socketSend(n)),this._queue=[]}}function Gi(t,e,n){var r,o;const c=(t.startsWith("https")?t.replace("https","wss"):t.startsWith("http")?t.replace("http","ws"):t).split("?"),l=nn()?{protocol:e,version:n,env:"browser",host:((r=Kt())===null||r===void 0?void 0:r.host)||""}:{protocol:e,version:n,env:((o=ge())===null||o===void 0?void 0:o.name)||""},d=hn(fn(c[1]||""),l);return c[0]+"?"+d}class Yi{constructor(){this._eventEmitters=[]}subscribe(e){this._eventEmitters.push(e)}unsubscribe(e){this._eventEmitters=this._eventEmitters.filter(n=>n.event!==e)}trigger(e){let n=[],r;vn(e)?r=e.method:B(e)||Z(e)?r=`response:${e.id}`:Te(e)?r=e.event:r="",r&&(n=this._eventEmitters.filter(o=>o.event===r)),(!n||!n.length)&&!yn(r)&&!Te(r)&&(n=this._eventEmitters.filter(o=>o.event==="call_request")),n.forEach(o=>{if(Z(e)){const i=new Error(e.error.message);o.callback(i,null)}else o.callback(null,e)})}}class Ki{constructor(e="walletconnect"){this.storageId=e}getSession(){let e=null;const n=Ge(this.storageId);return n&&mn(n)&&(e=n),e}setSession(e){return Je(this.storageId,e),e}removeSession(){Ye(this.storageId)}}const Zi="walletconnect.org",Xi="abcdefghijklmnopqrstuvwxyz0123456789",bn=Xi.split("").map(t=>`https://${t}.bridge.walletconnect.org`);function es(t){let e=t.indexOf("//")>-1?t.split("/")[2]:t.split("/")[0];return e=e.split(":")[0],e=e.split("?")[0],e}function ts(t){return es(t).split(".").slice(-2).join(".")}function ns(){return Math.floor(Math.random()*bn.length)}function rs(){return bn[ns()]}function os(t){return ts(t)===Zi}function is(t){return os(t)?rs():t}class ss{constructor(e){if(this.protocol="wc",this.version=1,this._bridge="",this._key=null,this._clientId="",this._clientMeta=null,this._peerId="",this._peerMeta=null,this._handshakeId=0,this._handshakeTopic="",this._connected=!1,this._accounts=[],this._chainId=0,this._networkId=0,this._rpcUrl="",this._eventManager=new Yi,this._clientMeta=Re()||e.connectorOpts.clientMeta||null,this._cryptoLib=e.cryptoLib,this._sessionStorage=e.sessionStorage||new Ki(e.connectorOpts.storageId),this._qrcodeModal=e.connectorOpts.qrcodeModal,this._qrcodeModalOptions=e.connectorOpts.qrcodeModalOptions,this._signingMethods=[...Ue,...e.connectorOpts.signingMethods||[]],!e.connectorOpts.bridge&&!e.connectorOpts.uri&&!e.connectorOpts.session)throw new Error(_o);e.connectorOpts.bridge&&(this.bridge=is(e.connectorOpts.bridge)),e.connectorOpts.uri&&(this.uri=e.connectorOpts.uri);const n=e.connectorOpts.session||this._getStorageSession();n&&(this.session=n),this.handshakeId&&this._subscribeToSessionResponse(this.handshakeId,"Session request rejected"),this._transport=e.transport||new Ji({protocol:this.protocol,version:this.version,url:this.bridge,subscriptions:[this.clientId]}),this._subscribeToInternalEvents(),this._initTransport(),e.connectorOpts.uri&&this._subscribeToSessionRequest(),e.pushServerOpts&&this._registerPushServer(e.pushServerOpts)}set bridge(e){e&&(this._bridge=e)}get bridge(){return this._bridge}set key(e){if(!e)return;const n=Jt(e);this._key=n}get key(){return this._key?Qt(this._key,!0):""}set clientId(e){e&&(this._clientId=e)}get clientId(){let e=this._clientId;return e||(e=this._clientId=se()),this._clientId}set peerId(e){e&&(this._peerId=e)}get peerId(){return this._peerId}set clientMeta(e){}get clientMeta(){let e=this._clientMeta;return e||(e=this._clientMeta=Re()),e}set peerMeta(e){this._peerMeta=e}get peerMeta(){return this._peerMeta}set handshakeTopic(e){e&&(this._handshakeTopic=e)}get handshakeTopic(){return this._handshakeTopic}set handshakeId(e){e&&(this._handshakeId=e)}get handshakeId(){return this._handshakeId}get uri(){return this._formatUri()}set uri(e){if(!e)return;const{handshakeTopic:n,bridge:r,key:o}=this._parseUri(e);this.handshakeTopic=n,this.bridge=r,this.key=o}set chainId(e){this._chainId=e}get chainId(){return this._chainId}set networkId(e){this._networkId=e}get networkId(){return this._networkId}set accounts(e){this._accounts=e}get accounts(){return this._accounts}set rpcUrl(e){this._rpcUrl=e}get rpcUrl(){return this._rpcUrl}set connected(e){}get connected(){return this._connected}set pending(e){}get pending(){return!!this._handshakeTopic}get session(){return{connected:this.connected,accounts:this.accounts,chainId:this.chainId,bridge:this.bridge,key:this.key,clientId:this.clientId,clientMeta:this.clientMeta,peerId:this.peerId,peerMeta:this.peerMeta,handshakeId:this.handshakeId,handshakeTopic:this.handshakeTopic}}set session(e){e&&(this._connected=e.connected,this.accounts=e.accounts,this.chainId=e.chainId,this.bridge=e.bridge,this.key=e.key,this.clientId=e.clientId,this.clientMeta=e.clientMeta,this.peerId=e.peerId,this.peerMeta=e.peerMeta,this.handshakeId=e.handshakeId,this.handshakeTopic=e.handshakeTopic)}on(e,n){const r={event:e,callback:n};this._eventManager.subscribe(r)}off(e){this._eventManager.unsubscribe(e)}async createInstantRequest(e){this._key=await this._generateKey();const n=this._formatRequest({method:"wc_instantRequest",params:[{peerId:this.clientId,peerMeta:this.clientMeta,request:this._formatRequest(e)}]});this.handshakeId=n.id,this.handshakeTopic=se(),this._eventManager.trigger({event:"display_uri",params:[this.uri]}),this.on("modal_closed",()=>{throw new Error(_t)});const r=()=>{this.killSession()};try{const o=await this._sendCallRequest(n);return o&&r(),o}catch(o){throw r(),o}}async connect(e){if(!this._qrcodeModal)throw new Error(ho);return this.connected?{chainId:this.chainId,accounts:this.accounts}:(await this.createSession(e),new Promise(async(n,r)=>{this.on("modal_closed",()=>r(new Error(_t))),this.on("connect",(o,i)=>{if(o)return r(o);n(i.params[0])})}))}async createSession(e){if(this._connected)throw new Error(Ee);if(this.pending)return;this._key=await this._generateKey();const n=this._formatRequest({method:"wc_sessionRequest",params:[{peerId:this.clientId,peerMeta:this.clientMeta,chainId:e&&e.chainId?e.chainId:null}]});this.handshakeId=n.id,this.handshakeTopic=se(),this._sendSessionRequest(n,"Session update rejected",{topic:this.handshakeTopic}),this._eventManager.trigger({event:"display_uri",params:[this.uri]})}approveSession(e){if(this._connected)throw new Error(Ee);this.chainId=e.chainId,this.accounts=e.accounts,this.networkId=e.networkId||0,this.rpcUrl=e.rpcUrl||"";const n={approved:!0,chainId:this.chainId,networkId:this.networkId,accounts:this.accounts,rpcUrl:this.rpcUrl,peerId:this.clientId,peerMeta:this.clientMeta},r={id:this.handshakeId,jsonrpc:"2.0",result:n};this._sendResponse(r),this._connected=!0,this._setStorageSession(),this._eventManager.trigger({event:"connect",params:[{peerId:this.peerId,peerMeta:this.peerMeta,chainId:this.chainId,accounts:this.accounts}]})}rejectSession(e){if(this._connected)throw new Error(Ee);const n=e&&e.message?e.message:io,r=this._formatResponse({id:this.handshakeId,error:{message:n}});this._sendResponse(r),this._connected=!1,this._eventManager.trigger({event:"disconnect",params:[{message:n}]}),this._removeStorageSession()}updateSession(e){if(!this._connected)throw new Error(D);this.chainId=e.chainId,this.accounts=e.accounts,this.networkId=e.networkId||0,this.rpcUrl=e.rpcUrl||"";const n={approved:!0,chainId:this.chainId,networkId:this.networkId,accounts:this.accounts,rpcUrl:this.rpcUrl},r=this._formatRequest({method:"wc_sessionUpdate",params:[n]});this._sendSessionRequest(r,"Session update rejected"),this._eventManager.trigger({event:"session_update",params:[{chainId:this.chainId,accounts:this.accounts}]}),this._manageStorageSession()}async killSession(e){const n=e?e.message:"Session Disconnected",r={approved:!1,chainId:null,networkId:null,accounts:null},o=this._formatRequest({method:"wc_sessionUpdate",params:[r]});await this._sendRequest(o),this._handleSessionDisconnect(n)}async sendTransaction(e){if(!this._connected)throw new Error(D);const n=e,r=this._formatRequest({method:"eth_sendTransaction",params:[n]});return await this._sendCallRequest(r)}async signTransaction(e){if(!this._connected)throw new Error(D);const n=e,r=this._formatRequest({method:"eth_signTransaction",params:[n]});return await this._sendCallRequest(r)}async signMessage(e){if(!this._connected)throw new Error(D);const n=this._formatRequest({method:"eth_sign",params:e});return await this._sendCallRequest(n)}async signPersonalMessage(e){if(!this._connected)throw new Error(D);const n=this._formatRequest({method:"personal_sign",params:e});return await this._sendCallRequest(n)}async signTypedData(e){if(!this._connected)throw new Error(D);const n=this._formatRequest({method:"eth_signTypedData",params:e});return await this._sendCallRequest(n)}async updateChain(e){if(!this._connected)throw new Error("Session currently disconnected");const n=this._formatRequest({method:"wallet_updateChain",params:[e]});return await this._sendCallRequest(n)}unsafeSend(e,n){return this._sendRequest(e,n),this._eventManager.trigger({event:"call_request_sent",params:[{request:e,options:n}]}),new Promise((r,o)=>{this._subscribeToResponse(e.id,(i,c)=>{if(i){o(i);return}if(!c)throw new Error(so);r(c)})})}async sendCustomRequest(e,n){if(!this._connected)throw new Error(D);switch(e.method){case"eth_accounts":return this.accounts;case"eth_chainId":return Gt(this.chainId);case"eth_sendTransaction":case"eth_signTransaction":e.params;break;case"personal_sign":e.params;break}const r=this._formatRequest(e);return await this._sendCallRequest(r,n)}approveRequest(e){if(B(e)){const n=this._formatResponse(e);this._sendResponse(n)}else throw new Error(ao)}rejectRequest(e){if(Z(e)){const n=this._formatResponse(e);this._sendResponse(n)}else throw new Error(co)}transportClose(){this._transport.close()}async _sendRequest(e,n){const r=this._formatRequest(e),o=await this._encrypt(r),i=typeof n?.topic<"u"?n.topic:this.peerId,c=JSON.stringify(o),l=typeof n?.forcePushNotification<"u"?!n.forcePushNotification:wn(r);this._transport.send(c,i,l)}async _sendResponse(e){const n=await this._encrypt(e),r=this.peerId,o=JSON.stringify(n),i=!0;this._transport.send(o,r,i)}async _sendSessionRequest(e,n,r){this._sendRequest(e,r),this._subscribeToSessionResponse(e.id,n)}_sendCallRequest(e,n){return this._sendRequest(e,n),this._eventManager.trigger({event:"call_request_sent",params:[{request:e,options:n}]}),this._subscribeToCallResponse(e.id)}_formatRequest(e){if(typeof e.method>"u")throw new Error(lo);return{id:typeof e.id>"u"?sn():e.id,jsonrpc:"2.0",method:e.method,params:typeof e.params>"u"?[]:e.params}}_formatResponse(e){if(typeof e.id>"u")throw new Error(uo);const n={id:e.id,jsonrpc:"2.0"};if(Z(e)){const r=un(e.error);return Object.assign(Object.assign(Object.assign({},n),e),{error:r})}else if(B(e))return Object.assign(Object.assign({},n),e);throw new Error(ut)}_handleSessionDisconnect(e){const n=e||"Session Disconnected";this._connected||(this._qrcodeModal&&this._qrcodeModal.close(),Ye(Ie)),this._connected&&(this._connected=!1),this._handshakeId&&(this._handshakeId=0),this._handshakeTopic&&(this._handshakeTopic=""),this._peerId&&(this._peerId=""),this._eventManager.trigger({event:"disconnect",params:[{message:n}]}),this._removeStorageSession(),this.transportClose()}_handleSessionResponse(e,n){n?n.approved?(this._connected?(n.chainId&&(this.chainId=n.chainId),n.accounts&&(this.accounts=n.accounts),this._eventManager.trigger({event:"session_update",params:[{chainId:this.chainId,accounts:this.accounts}]})):(this._connected=!0,n.chainId&&(this.chainId=n.chainId),n.accounts&&(this.accounts=n.accounts),n.peerId&&!this.peerId&&(this.peerId=n.peerId),n.peerMeta&&!this.peerMeta&&(this.peerMeta=n.peerMeta),this._eventManager.trigger({event:"connect",params:[{peerId:this.peerId,peerMeta:this.peerMeta,chainId:this.chainId,accounts:this.accounts}]})),this._manageStorageSession()):this._handleSessionDisconnect(e):this._handleSessionDisconnect(e)}async _handleIncomingMessages(e){if(![this.clientId,this.handshakeTopic].includes(e.topic))return;let r;try{r=JSON.parse(e.payload)}catch{return}const o=await this._decrypt(r);o&&this._eventManager.trigger(o)}_subscribeToSessionRequest(){this._transport.subscribe(this.handshakeTopic)}_subscribeToResponse(e,n){this.on(`response:${e}`,n)}_subscribeToSessionResponse(e,n){this._subscribeToResponse(e,(r,o)=>{if(r){this._handleSessionResponse(r.message);return}B(o)?this._handleSessionResponse(n,o.result):o.error&&o.error.message?this._handleSessionResponse(o.error.message):this._handleSessionResponse(n)})}_subscribeToCallResponse(e){return new Promise((n,r)=>{this._subscribeToResponse(e,(o,i)=>{if(o){r(o);return}B(i)?n(i.result):i.error&&i.error.message?r(i.error):r(new Error(ut))})})}_subscribeToInternalEvents(){this.on("display_uri",()=>{this._qrcodeModal&&this._qrcodeModal.open(this.uri,()=>{this._eventManager.trigger({event:"modal_closed",params:[]})},this._qrcodeModalOptions)}),this.on("connect",()=>{this._qrcodeModal&&this._qrcodeModal.close()}),this.on("call_request_sent",(e,n)=>{const{request:r}=n.params[0];if(en()&&this._signingMethods.includes(r.method)){const o=Ge(Ie);o&&(window.location.href=o.href)}}),this.on("wc_sessionRequest",(e,n)=>{e&&this._eventManager.trigger({event:"error",params:[{code:"SESSION_REQUEST_ERROR",message:e.toString()}]}),this.handshakeId=n.id,this.peerId=n.params[0].peerId,this.peerMeta=n.params[0].peerMeta;const r=Object.assign(Object.assign({},n),{method:"session_request"});this._eventManager.trigger(r)}),this.on("wc_sessionUpdate",(e,n)=>{e&&this._handleSessionResponse(e.message),this._handleSessionResponse("Session disconnected",n.params[0])})}_initTransport(){this._transport.on("message",e=>this._handleIncomingMessages(e)),this._transport.on("open",()=>this._eventManager.trigger({event:"transport_open",params:[]})),this._transport.on("close",()=>this._eventManager.trigger({event:"transport_close",params:[]})),this._transport.on("error",()=>this._eventManager.trigger({event:"transport_error",params:["Websocket connection failed"]})),this._transport.open()}_formatUri(){const e=this.protocol,n=this.handshakeTopic,r=this.version,o=encodeURIComponent(this.bridge),i=this.key;return`${e}:${n}@${r}?bridge=${o}&key=${i}`}_parseUri(e){const n=gn(e);if(n.protocol===this.protocol){if(!n.handshakeTopic)throw Error("Invalid or missing handshakeTopic parameter value");const r=n.handshakeTopic;if(!n.bridge)throw Error("Invalid or missing bridge url parameter value");const o=decodeURIComponent(n.bridge);if(!n.key)throw Error("Invalid or missing key parameter value");const i=n.key;return{handshakeTopic:r,bridge:o,key:i}}else throw new Error(fo)}async _generateKey(){return this._cryptoLib?await this._cryptoLib.generateKey():null}async _encrypt(e){const n=this._key;return this._cryptoLib&&n?await this._cryptoLib.encrypt(e,n):null}async _decrypt(e){const n=this._key;return this._cryptoLib&&n?await this._cryptoLib.decrypt(e,n):null}_getStorageSession(){let e=null;return this._sessionStorage&&(e=this._sessionStorage.getSession()),e}_setStorageSession(){this._sessionStorage&&this._sessionStorage.setSession(this.session)}_removeStorageSession(){this._sessionStorage&&this._sessionStorage.removeSession()}_manageStorageSession(){this._connected?this._setStorageSession():this._removeStorageSession()}_registerPushServer(e){if(!e.url||typeof e.url!="string")throw Error("Invalid or missing pushServerOpts.url parameter value");if(!e.type||typeof e.type!="string")throw Error("Invalid or missing pushServerOpts.type parameter value");if(!e.token||typeof e.token!="string")throw Error("Invalid or missing pushServerOpts.token parameter value");const n={bridge:this.bridge,topic:this.clientId,type:e.type,token:e.token,peerName:"",language:e.language||""};this.on("connect",async(r,o)=>{if(r)throw r;if(e.peerMeta){const i=o.params[0].peerMeta.name;n.peerName=i}try{if(!(await(await fetch(`${e.url}/new`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(n)})).json()).success)throw Error("Failed to register in Push Server")}catch{throw Error("Failed to register in Push Server")}})}}function as(t){return te.getBrowerCrypto().getRandomValues(new Uint8Array(t))}const kn=256,En=kn,cs=kn,P="AES-CBC",ls=`SHA-${En}`,Oe="HMAC",us="encrypt",_s="decrypt",ds="sign",fs="verify";function hs(t){return t===P?{length:En,name:P}:{hash:{name:ls},name:Oe}}function ps(t){return t===P?[us,_s]:[ds,fs]}async function Xe(t,e=P){return te.getSubtleCrypto().importKey("raw",t,hs(e),!0,ps(e))}async function ms(t,e,n){const r=te.getSubtleCrypto(),o=await Xe(e,P),i=await r.encrypt({iv:t,name:P},o,n);return new Uint8Array(i)}async function gs(t,e,n){const r=te.getSubtleCrypto(),o=await Xe(e,P),i=await r.decrypt({iv:t,name:P},o,n);return new Uint8Array(i)}async function vs(t,e){const n=te.getSubtleCrypto(),r=await Xe(t,Oe),o=await n.sign({length:cs,name:Oe},r,e);return new Uint8Array(o)}function ys(t,e,n){return ms(t,e,n)}function ws(t,e,n){return gs(t,e,n)}async function Cn(t,e){return await vs(t,e)}async function Sn(t){const e=(t||256)/8,n=as(e);return Vt(J(n))}async function xn(t,e){const n=$(t.data),r=$(t.iv),o=$(t.hmac),i=U(o,!1),c=zt(n,r),l=await Cn(e,c),d=U(l,!1);return Q(i)===Q(d)}async function bs(t,e,n){const r=z(le(e)),o=n||await Sn(128),i=z(le(o)),c=U(i,!1),l=JSON.stringify(t),d=Wt(l),p=await ys(i,r,d),s=U(p,!1),w=zt(p,i),g=await Cn(r,w),m=U(g,!1);return{data:s,hmac:m,iv:c}}async function ks(t,e){const n=z(le(e));if(!n)throw new Error("Missing key: required for decryption");if(!await xn(t,n))return null;const o=$(t.data),i=$(t.iv),c=await ws(i,n,o),l=Ht(c);let d;try{d=JSON.parse(l)}catch{return null}return d}const Es=Object.freeze(Object.defineProperty({__proto__:null,decrypt:ks,encrypt:bs,generateKey:Sn,verifyHmac:xn},Symbol.toStringTag,{value:"Module"}));class Cs extends ss{constructor(e,n){super({cryptoLib:Es,connectorOpts:e,pushServerOpts:n})}}const Ss=qt(zi);var xs=function(){var t=document.getSelection();if(!t.rangeCount)return function(){};for(var e=document.activeElement,n=[],r=0;r<t.rangeCount;r++)n.push(t.getRangeAt(r));switch(e.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":e.blur();break;default:e=null;break}return t.removeAllRanges(),function(){t.type==="Caret"&&t.removeAllRanges(),t.rangeCount||n.forEach(function(o){t.addRange(o)}),e&&e.focus()}},Is=xs,dt={"text/plain":"Text","text/html":"Url",default:"Text"},Rs="Copy to clipboard: #{key}, Enter";function Ts(t){var e=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C";return t.replace(/#{\s*key\s*}/g,e)}function Os(t,e){var n,r,o,i,c,l,d=!1;e||(e={}),n=e.debug||!1;try{o=Is(),i=document.createRange(),c=document.getSelection(),l=document.createElement("span"),l.textContent=t,l.ariaHidden="true",l.style.all="unset",l.style.position="fixed",l.style.top=0,l.style.clip="rect(0, 0, 0, 0)",l.style.whiteSpace="pre",l.style.webkitUserSelect="text",l.style.MozUserSelect="text",l.style.msUserSelect="text",l.style.userSelect="text",l.addEventListener("copy",function(s){if(s.stopPropagation(),e.format)if(s.preventDefault(),typeof s.clipboardData>"u"){n&&console.warn("unable to use e.clipboardData"),n&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var w=dt[e.format]||dt.default;window.clipboardData.setData(w,t)}else s.clipboardData.clearData(),s.clipboardData.setData(e.format,t);e.onCopy&&(s.preventDefault(),e.onCopy(s.clipboardData))}),document.body.appendChild(l),i.selectNodeContents(l),c.addRange(i);var p=document.execCommand("copy");if(!p)throw new Error("copy command was unsuccessful");d=!0}catch(s){n&&console.error("unable to copy using execCommand: ",s),n&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(e.format||"text",t),e.onCopy&&e.onCopy(window.clipboardData),d=!0}catch(w){n&&console.error("unable to copy using clipboardData: ",w),n&&console.error("falling back to prompt"),r=Ts("message"in e?e.message:Rs),window.prompt(r,t)}}finally{c&&(typeof c.removeRange=="function"?c.removeRange(i):c.removeAllRanges()),l&&document.body.removeChild(l),o()}return d}var Ns=Os,re,y,In,H,ft,Rn,Ne,Tn,ue={},On=[],Ms=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ye=Array.isArray;function M(t,e){for(var n in e)t[n]=e[n];return t}function Nn(t){var e=t.parentNode;e&&e.removeChild(t)}function N(t,e,n){var r,o,i,c={};for(i in e)i=="key"?r=e[i]:i=="ref"?o=e[i]:c[i]=e[i];if(arguments.length>2&&(c.children=arguments.length>3?re.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(i in t.defaultProps)c[i]===void 0&&(c[i]=t.defaultProps[i]);return Y(t,c,r,o,null)}function Y(t,e,n,r,o){var i={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:o??++In};return o==null&&y.vnode!=null&&y.vnode(i),i}function Mn(){return{current:null}}function A(t){return t.children}function O(t,e){this.props=t,this.context=e}function X(t,e){if(e==null)return t.__?X(t.__,t.__.__k.indexOf(t)+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?X(t):null}function Ln(t){var e,n;if((t=t.__)!=null&&t.__c!=null){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null){t.__e=t.__c.base=n.__e;break}return Ln(t)}}function Me(t){(!t.__d&&(t.__d=!0)&&H.push(t)&&!_e.__r++||ft!==y.debounceRendering)&&((ft=y.debounceRendering)||Rn)(_e)}function _e(){var t,e,n,r,o,i,c,l;for(H.sort(Ne);t=H.shift();)t.__d&&(e=H.length,r=void 0,o=void 0,c=(i=(n=t).__v).__e,(l=n.__P)&&(r=[],(o=M({},i)).__v=i.__v+1,et(l,i,o,n.__n,l.ownerSVGElement!==void 0,i.__h!=null?[c]:null,r,c??X(i),i.__h),Pn(r,i),i.__e!=c&&Ln(i)),H.length>e&&H.sort(Ne));_e.__r=0}function An(t,e,n,r,o,i,c,l,d,p){var s,w,g,m,k,I,C,a=r&&r.__k||On,u=a.length;for(n.__k=[],s=0;s<e.length;s++)if((m=n.__k[s]=(m=e[s])==null||typeof m=="boolean"||typeof m=="function"?null:typeof m=="string"||typeof m=="number"||typeof m=="bigint"?Y(null,m,null,null,m):ye(m)?Y(A,{children:m},null,null,null):m.__b>0?Y(m.type,m.props,m.key,m.ref?m.ref:null,m.__v):m)!=null){if(m.__=n,m.__b=n.__b+1,(g=a[s])===null||g&&m.key==g.key&&m.type===g.type)a[s]=void 0;else for(w=0;w<u;w++){if((g=a[w])&&m.key==g.key&&m.type===g.type){a[w]=void 0;break}g=null}et(t,m,g=g||ue,o,i,c,l,d,p),k=m.__e,(w=m.ref)&&g.ref!=w&&(C||(C=[]),g.ref&&C.push(g.ref,null,m),C.push(w,m.__c||k,m)),k!=null?(I==null&&(I=k),typeof m.type=="function"&&m.__k===g.__k?m.__d=d=qn(m,d,t):d=Un(t,m,g,a,k,d),typeof n.type=="function"&&(n.__d=d)):d&&g.__e==d&&d.parentNode!=t&&(d=X(g))}for(n.__e=I,s=u;s--;)a[s]!=null&&(typeof n.type=="function"&&a[s].__e!=null&&a[s].__e==n.__d&&(n.__d=$n(r).nextSibling),Hn(a[s],a[s]));if(C)for(s=0;s<C.length;s++)Dn(C[s],C[++s],C[++s])}function qn(t,e,n){for(var r,o=t.__k,i=0;o&&i<o.length;i++)(r=o[i])&&(r.__=t,e=typeof r.type=="function"?qn(r,e,n):Un(n,r,r,o,r.__e,e));return e}function L(t,e){return e=e||[],t==null||typeof t=="boolean"||(ye(t)?t.some(function(n){L(n,e)}):e.push(t)),e}function Un(t,e,n,r,o,i){var c,l,d;if(e.__d!==void 0)c=e.__d,e.__d=void 0;else if(n==null||o!=i||o.parentNode==null)e:if(i==null||i.parentNode!==t)t.appendChild(o),c=null;else{for(l=i,d=0;(l=l.nextSibling)&&d<r.length;d+=1)if(l==o)break e;t.insertBefore(o,i),c=i}return c!==void 0?c:o.nextSibling}function $n(t){var e,n,r;if(t.type==null||typeof t.type=="string")return t.__e;if(t.__k){for(e=t.__k.length-1;e>=0;e--)if((n=t.__k[e])&&(r=$n(n)))return r}return null}function Ls(t,e,n,r,o){var i;for(i in n)i==="children"||i==="key"||i in e||de(t,i,null,n[i],r);for(i in e)o&&typeof e[i]!="function"||i==="children"||i==="key"||i==="value"||i==="checked"||n[i]===e[i]||de(t,i,e[i],n[i],r)}function ht(t,e,n){e[0]==="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Ms.test(e)?n:n+"px"}function de(t,e,n,r,o){var i;e:if(e==="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||ht(t.style,e,"");if(n)for(e in n)r&&n[e]===r[e]||ht(t.style,e,n[e])}else if(e[0]==="o"&&e[1]==="n")i=e!==(e=e.replace(/Capture$/,"")),e=e.toLowerCase()in t?e.toLowerCase().slice(2):e.slice(2),t.l||(t.l={}),t.l[e+i]=n,n?r||t.addEventListener(e,i?mt:pt,i):t.removeEventListener(e,i?mt:pt,i);else if(e!=="dangerouslySetInnerHTML"){if(o)e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!=="width"&&e!=="height"&&e!=="href"&&e!=="list"&&e!=="form"&&e!=="tabIndex"&&e!=="download"&&e!=="rowSpan"&&e!=="colSpan"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!=="-"?t.removeAttribute(e):t.setAttribute(e,n))}}function pt(t){return this.l[t.type+!1](y.event?y.event(t):t)}function mt(t){return this.l[t.type+!0](y.event?y.event(t):t)}function et(t,e,n,r,o,i,c,l,d){var p,s,w,g,m,k,I,C,a,u,h,_,v,E,b,S=e.type;if(e.constructor!==void 0)return null;n.__h!=null&&(d=n.__h,l=e.__e=n.__e,e.__h=null,i=[l]),(p=y.__b)&&p(e);try{e:if(typeof S=="function"){if(C=e.props,a=(p=S.contextType)&&r[p.__c],u=p?a?a.props.value:p.__:r,n.__c?I=(s=e.__c=n.__c).__=s.__E:("prototype"in S&&S.prototype.render?e.__c=s=new S(C,u):(e.__c=s=new O(C,u),s.constructor=S,s.render=qs),a&&a.sub(s),s.props=C,s.state||(s.state={}),s.context=u,s.__n=r,w=s.__d=!0,s.__h=[],s._sb=[]),s.__s==null&&(s.__s=s.state),S.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=M({},s.__s)),M(s.__s,S.getDerivedStateFromProps(C,s.__s))),g=s.props,m=s.state,s.__v=e,w)S.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(S.getDerivedStateFromProps==null&&C!==g&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(C,u),!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(C,s.__s,u)===!1||e.__v===n.__v){for(e.__v!==n.__v&&(s.props=C,s.state=s.__s,s.__d=!1),s.__e=!1,e.__e=n.__e,e.__k=n.__k,e.__k.forEach(function(T){T&&(T.__=e)}),h=0;h<s._sb.length;h++)s.__h.push(s._sb[h]);s._sb=[],s.__h.length&&c.push(s);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(C,s.__s,u),s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(g,m,k)})}if(s.context=u,s.props=C,s.__P=t,_=y.__r,v=0,"prototype"in S&&S.prototype.render){for(s.state=s.__s,s.__d=!1,_&&_(e),p=s.render(s.props,s.state,s.context),E=0;E<s._sb.length;E++)s.__h.push(s._sb[E]);s._sb=[]}else do s.__d=!1,_&&_(e),p=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++v<25);s.state=s.__s,s.getChildContext!=null&&(r=M(M({},r),s.getChildContext())),w||s.getSnapshotBeforeUpdate==null||(k=s.getSnapshotBeforeUpdate(g,m)),An(t,ye(b=p!=null&&p.type===A&&p.key==null?p.props.children:p)?b:[b],e,n,r,o,i,c,l,d),s.base=e.__e,e.__h=null,s.__h.length&&c.push(s),I&&(s.__E=s.__=null),s.__e=!1}else i==null&&e.__v===n.__v?(e.__k=n.__k,e.__e=n.__e):e.__e=As(n.__e,e,n,r,o,i,c,d);(p=y.diffed)&&p(e)}catch(T){e.__v=null,(d||i!=null)&&(e.__e=l,e.__h=!!d,i[i.indexOf(l)]=null),y.__e(T,e,n)}}function Pn(t,e){y.__c&&y.__c(e,t),t.some(function(n){try{t=n.__h,n.__h=[],t.some(function(r){r.call(n)})}catch(r){y.__e(r,n.__v)}})}function As(t,e,n,r,o,i,c,l){var d,p,s,w=n.props,g=e.props,m=e.type,k=0;if(m==="svg"&&(o=!0),i!=null){for(;k<i.length;k++)if((d=i[k])&&"setAttribute"in d==!!m&&(m?d.localName===m:d.nodeType===3)){t=d,i[k]=null;break}}if(t==null){if(m===null)return document.createTextNode(g);t=o?document.createElementNS("http://www.w3.org/2000/svg",m):document.createElement(m,g.is&&g),i=null,l=!1}if(m===null)w===g||l&&t.data===g||(t.data=g);else{if(i=i&&re.call(t.childNodes),p=(w=n.props||ue).dangerouslySetInnerHTML,s=g.dangerouslySetInnerHTML,!l){if(i!=null)for(w={},k=0;k<t.attributes.length;k++)w[t.attributes[k].name]=t.attributes[k].value;(s||p)&&(s&&(p&&s.__html==p.__html||s.__html===t.innerHTML)||(t.innerHTML=s&&s.__html||""))}if(Ls(t,g,w,o,l),s)e.__k=[];else if(An(t,ye(k=e.props.children)?k:[k],e,n,r,o&&m!=="foreignObject",i,c,i?i[0]:n.__k&&X(n,0),l),i!=null)for(k=i.length;k--;)i[k]!=null&&Nn(i[k]);l||("value"in g&&(k=g.value)!==void 0&&(k!==t.value||m==="progress"&&!k||m==="option"&&k!==w.value)&&de(t,"value",k,w.value,!1),"checked"in g&&(k=g.checked)!==void 0&&k!==t.checked&&de(t,"checked",k,w.checked,!1))}return t}function Dn(t,e,n){try{typeof t=="function"?t(e):t.current=e}catch(r){y.__e(r,n)}}function Hn(t,e,n){var r,o;if(y.unmount&&y.unmount(t),(r=t.ref)&&(r.current&&r.current!==t.__e||Dn(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(i){y.__e(i,e)}r.base=r.__P=null,t.__c=void 0}if(r=t.__k)for(o=0;o<r.length;o++)r[o]&&Hn(r[o],e,n||typeof t.type!="function");n||t.__e==null||Nn(t.__e),t.__=t.__e=t.__d=void 0}function qs(t,e,n){return this.constructor(t,n)}function ee(t,e,n){var r,o,i;y.__&&y.__(t,e),o=(r=typeof n=="function")?null:n&&n.__k||e.__k,i=[],et(e,t=(!r&&n||e).__k=N(A,null,[t]),o||ue,ue,e.ownerSVGElement!==void 0,!r&&n?[n]:o?null:e.firstChild?re.call(e.childNodes):null,i,!r&&n?n:o?o.__e:e.firstChild,r),Pn(i,t)}function jn(t,e){ee(t,e,jn)}function Us(t,e,n){var r,o,i,c,l=M({},t.props);for(i in t.type&&t.type.defaultProps&&(c=t.type.defaultProps),e)i=="key"?r=e[i]:i=="ref"?o=e[i]:l[i]=e[i]===void 0&&c!==void 0?c[i]:e[i];return arguments.length>2&&(l.children=arguments.length>3?re.call(arguments,2):n),Y(t.type,l,r||t.key,o||t.ref,null)}function Wn(t,e){var n={__c:e="__cC"+Tn++,__:t,Consumer:function(r,o){return r.children(o)},Provider:function(r){var o,i;return this.getChildContext||(o=[],(i={})[e]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(c){this.props.value!==c.value&&o.some(function(l){l.__e=!0,Me(l)})},this.sub=function(c){o.push(c);var l=c.componentWillUnmount;c.componentWillUnmount=function(){o.splice(o.indexOf(c),1),l&&l.call(c)}}),r.children}};return n.Provider.__=n.Consumer.contextType=n}re=On.slice,y={__e:function(t,e,n,r){for(var o,i,c;e=e.__;)if((o=e.__c)&&!o.__)try{if((i=o.constructor)&&i.getDerivedStateFromError!=null&&(o.setState(i.getDerivedStateFromError(t)),c=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(t,r||{}),c=o.__d),c)return o.__E=o}catch(l){t=l}throw t}},In=0,O.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=M({},this.state),typeof t=="function"&&(t=t(M({},n),this.props)),t&&M(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Me(this))},O.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Me(this))},O.prototype.render=A,H=[],Rn=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Ne=function(t,e){return t.__v.__b-e.__v.__b},_e.__r=0,Tn=0;var q,x,Ce,gt,V=0,Bn=[],ae=[],vt=y.__b,yt=y.__r,wt=y.diffed,bt=y.__c,kt=y.unmount;function j(t,e){y.__h&&y.__h(x,t,V||e),V=0;var n=x.__H||(x.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({__V:ae}),n.__[t]}function we(t){return V=1,tt(Yn,t)}function tt(t,e,n){var r=j(q++,2);if(r.t=t,!r.__c&&(r.__=[n?n(e):Yn(void 0,e),function(l){var d=r.__N?r.__N[0]:r.__[0],p=r.t(d,l);d!==p&&(r.__N=[p,r.__[1]],r.__c.setState({}))}],r.__c=x,!x.u)){var o=function(l,d,p){if(!r.__c.__H)return!0;var s=r.__c.__H.__.filter(function(g){return g.__c});if(s.every(function(g){return!g.__N}))return!i||i.call(this,l,d,p);var w=!1;return s.forEach(function(g){if(g.__N){var m=g.__[0];g.__=g.__N,g.__N=void 0,m!==g.__[0]&&(w=!0)}}),!(!w&&r.__c.props===l)&&(!i||i.call(this,l,d,p))};x.u=!0;var i=x.shouldComponentUpdate,c=x.componentWillUpdate;x.componentWillUpdate=function(l,d,p){if(this.__e){var s=i;i=void 0,o(l,d,p),i=s}c&&c.call(this,l,d,p)},x.shouldComponentUpdate=o}return r.__N||r.__}function nt(t,e){var n=j(q++,3);!y.__s&&rt(n.__H,e)&&(n.__=t,n.i=e,x.__H.__h.push(n))}function oe(t,e){var n=j(q++,4);!y.__s&&rt(n.__H,e)&&(n.__=t,n.i=e,x.__h.push(n))}function Fn(t){return V=5,be(function(){return{current:t}},[])}function zn(t,e,n){V=6,oe(function(){return typeof t=="function"?(t(e()),function(){return t(null)}):t?(t.current=e(),function(){return t.current=null}):void 0},n==null?n:n.concat(t))}function be(t,e){var n=j(q++,7);return rt(n.__H,e)?(n.__V=t(),n.i=e,n.__h=t,n.__V):n.__}function Qn(t,e){return V=8,be(function(){return t},e)}function Vn(t){var e=x.context[t.__c],n=j(q++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(x)),e.props.value):t.__}function Jn(t,e){y.useDebugValue&&y.useDebugValue(e?e(t):t)}function $s(t){var e=j(q++,10),n=we();return e.__=t,x.componentDidCatch||(x.componentDidCatch=function(r,o){e.__&&e.__(r,o),n[1](r)}),[n[0],function(){n[1](void 0)}]}function Gn(){var t=j(q++,11);if(!t.__){for(var e=x.__v;e!==null&&!e.__m&&e.__!==null;)e=e.__;var n=e.__m||(e.__m=[0,0]);t.__="P"+n[0]+"-"+n[1]++}return t.__}function Ps(){for(var t;t=Bn.shift();)if(t.__P&&t.__H)try{t.__H.__h.forEach(ce),t.__H.__h.forEach(Le),t.__H.__h=[]}catch(e){t.__H.__h=[],y.__e(e,t.__v)}}y.__b=function(t){x=null,vt&&vt(t)},y.__r=function(t){yt&&yt(t),q=0;var e=(x=t.__c).__H;e&&(Ce===x?(e.__h=[],x.__h=[],e.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=ae,n.__N=n.i=void 0})):(e.__h.forEach(ce),e.__h.forEach(Le),e.__h=[],q=0)),Ce=x},y.diffed=function(t){wt&&wt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Bn.push(e)!==1&&gt===y.requestAnimationFrame||((gt=y.requestAnimationFrame)||Ds)(Ps)),e.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==ae&&(n.__=n.__V),n.i=void 0,n.__V=ae})),Ce=x=null},y.__c=function(t,e){e.some(function(n){try{n.__h.forEach(ce),n.__h=n.__h.filter(function(r){return!r.__||Le(r)})}catch(r){e.some(function(o){o.__h&&(o.__h=[])}),e=[],y.__e(r,n.__v)}}),bt&&bt(t,e)},y.unmount=function(t){kt&&kt(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.forEach(function(r){try{ce(r)}catch(o){e=o}}),n.__H=void 0,e&&y.__e(e,n.__v))};var Et=typeof requestAnimationFrame=="function";function Ds(t){var e,n=function(){clearTimeout(r),Et&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,100);Et&&(e=requestAnimationFrame(n))}function ce(t){var e=x,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),x=e}function Le(t){var e=x;t.__c=t.__(),x=e}function rt(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function Yn(t,e){return typeof e=="function"?e(t):e}function Kn(t,e){for(var n in e)t[n]=e[n];return t}function Ae(t,e){for(var n in t)if(n!=="__source"&&!(n in e))return!0;for(var r in e)if(r!=="__source"&&t[r]!==e[r])return!0;return!1}function Se(t,e){return t===e&&(t!==0||1/t==1/e)||t!=t&&e!=e}function fe(t){this.props=t}function Zn(t,e){function n(o){var i=this.props.ref,c=i==o.ref;return!c&&i&&(i.call?i(null):i.current=null),e?!e(this.props,o)||!c:Ae(this.props,o)}function r(o){return this.shouldComponentUpdate=n,N(t,o)}return r.displayName="Memo("+(t.displayName||t.name)+")",r.prototype.isReactComponent=!0,r.__f=!0,r}(fe.prototype=new O).isPureReactComponent=!0,fe.prototype.shouldComponentUpdate=function(t,e){return Ae(this.props,t)||Ae(this.state,e)};var Ct=y.__b;y.__b=function(t){t.type&&t.type.__f&&t.ref&&(t.props.ref=t.ref,t.ref=null),Ct&&Ct(t)};var Hs=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function Xn(t){function e(n){var r=Kn({},n);return delete r.ref,t(r,n.ref||null)}return e.$$typeof=Hs,e.render=e,e.prototype.isReactComponent=e.__f=!0,e.displayName="ForwardRef("+(t.displayName||t.name)+")",e}var St=function(t,e){return t==null?null:L(L(t).map(e))},er={map:St,forEach:St,count:function(t){return t?L(t).length:0},only:function(t){var e=L(t);if(e.length!==1)throw"Children.only";return e[0]},toArray:L},js=y.__e;y.__e=function(t,e,n,r){if(t.then){for(var o,i=e;i=i.__;)if((o=i.__c)&&o.__c)return e.__e==null&&(e.__e=n.__e,e.__k=n.__k),o.__c(t,e)}js(t,e,n,r)};var xt=y.unmount;function tr(t,e,n){return t&&(t.__c&&t.__c.__H&&(t.__c.__H.__.forEach(function(r){typeof r.__c=="function"&&r.__c()}),t.__c.__H=null),(t=Kn({},t)).__c!=null&&(t.__c.__P===n&&(t.__c.__P=e),t.__c=null),t.__k=t.__k&&t.__k.map(function(r){return tr(r,e,n)})),t}function nr(t,e,n){return t&&(t.__v=null,t.__k=t.__k&&t.__k.map(function(r){return nr(r,e,n)}),t.__c&&t.__c.__P===e&&(t.__e&&n.insertBefore(t.__e,t.__d),t.__c.__e=!0,t.__c.__P=n)),t}function K(){this.__u=0,this.t=null,this.__b=null}function rr(t){var e=t.__.__c;return e&&e.__a&&e.__a(t)}function or(t){var e,n,r;function o(i){if(e||(e=t()).then(function(c){n=c.default||c},function(c){r=c}),r)throw r;if(!n)throw e;return N(n,i)}return o.displayName="Lazy",o.__f=!0,o}function F(){this.u=null,this.o=null}y.unmount=function(t){var e=t.__c;e&&e.__R&&e.__R(),e&&t.__h===!0&&(t.type=null),xt&&xt(t)},(K.prototype=new O).__c=function(t,e){var n=e.__c,r=this;r.t==null&&(r.t=[]),r.t.push(n);var o=rr(r.__v),i=!1,c=function(){i||(i=!0,n.__R=null,o?o(l):l())};n.__R=c;var l=function(){if(!--r.__u){if(r.state.__a){var p=r.state.__a;r.__v.__k[0]=nr(p,p.__c.__P,p.__c.__O)}var s;for(r.setState({__a:r.__b=null});s=r.t.pop();)s.forceUpdate()}},d=e.__h===!0;r.__u++||d||r.setState({__a:r.__b=r.__v.__k[0]}),t.then(c,c)},K.prototype.componentWillUnmount=function(){this.t=[]},K.prototype.render=function(t,e){if(this.__b){if(this.__v.__k){var n=document.createElement("div"),r=this.__v.__k[0].__c;this.__v.__k[0]=tr(this.__b,n,r.__O=r.__P)}this.__b=null}var o=e.__a&&N(A,null,t.fallback);return o&&(o.__h=null),[N(A,null,e.__a?null:t.children),o]};var It=function(t,e,n){if(++n[1]===n[0]&&t.o.delete(e),t.props.revealOrder&&(t.props.revealOrder[0]!=="t"||!t.o.size))for(n=t.u;n;){for(;n.length>3;)n.pop()();if(n[1]<n[0])break;t.u=n=n[2]}};function Ws(t){return this.getChildContext=function(){return t.context},t.children}function Bs(t){var e=this,n=t.i;e.componentWillUnmount=function(){ee(null,e.l),e.l=null,e.i=null},e.i&&e.i!==n&&e.componentWillUnmount(),t.__v?(e.l||(e.i=n,e.l={nodeType:1,parentNode:n,childNodes:[],appendChild:function(r){this.childNodes.push(r),e.i.appendChild(r)},insertBefore:function(r,o){this.childNodes.push(r),e.i.appendChild(r)},removeChild:function(r){this.childNodes.splice(this.childNodes.indexOf(r)>>>1,1),e.i.removeChild(r)}}),ee(N(Ws,{context:e.context},t.__v),e.l)):e.l&&e.componentWillUnmount()}function ir(t,e){var n=N(Bs,{__v:t,i:e});return n.containerInfo=e,n}(F.prototype=new O).__a=function(t){var e=this,n=rr(e.__v),r=e.o.get(t);return r[0]++,function(o){var i=function(){e.props.revealOrder?(r.push(o),It(e,t,r)):o()};n?n(i):i()}},F.prototype.render=function(t){this.u=null,this.o=new Map;var e=L(t.children);t.revealOrder&&t.revealOrder[0]==="b"&&e.reverse();for(var n=e.length;n--;)this.o.set(e[n],this.u=[1,0,this.u]);return t.children},F.prototype.componentDidUpdate=F.prototype.componentDidMount=function(){var t=this;this.o.forEach(function(e,n){It(t,n,e)})};var sr=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.element")||60103,Fs=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,zs=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,Qs=/[A-Z0-9]/g,Vs=typeof document<"u",Js=function(t){return(typeof Symbol<"u"&&typeof Symbol()=="symbol"?/fil|che|rad/:/fil|che|ra/).test(t)};function ar(t,e,n){return e.__k==null&&(e.textContent=""),ee(t,e),typeof n=="function"&&n(),t?t.__c:null}function cr(t,e,n){return jn(t,e),typeof n=="function"&&n(),t?t.__c:null}O.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(t){Object.defineProperty(O.prototype,t,{configurable:!0,get:function(){return this["UNSAFE_"+t]},set:function(e){Object.defineProperty(this,t,{configurable:!0,writable:!0,value:e})}})});var Rt=y.event;function Gs(){}function Ys(){return this.cancelBubble}function Ks(){return this.defaultPrevented}y.event=function(t){return Rt&&(t=Rt(t)),t.persist=Gs,t.isPropagationStopped=Ys,t.isDefaultPrevented=Ks,t.nativeEvent=t};var ot,Zs={enumerable:!1,configurable:!0,get:function(){return this.class}},Tt=y.vnode;y.vnode=function(t){typeof t.type=="string"&&function(e){var n=e.props,r=e.type,o={};for(var i in n){var c=n[i];if(!(i==="value"&&"defaultValue"in n&&c==null||Vs&&i==="children"&&r==="noscript"||i==="class"||i==="className")){var l=i.toLowerCase();i==="defaultValue"&&"value"in n&&n.value==null?i="value":i==="download"&&c===!0?c="":l==="ondoubleclick"?i="ondblclick":l!=="onchange"||r!=="input"&&r!=="textarea"||Js(n.type)?l==="onfocus"?i="onfocusin":l==="onblur"?i="onfocusout":zs.test(i)?i=l:r.indexOf("-")===-1&&Fs.test(i)?i=i.replace(Qs,"-$&").toLowerCase():c===null&&(c=void 0):l=i="oninput",l==="oninput"&&o[i=l]&&(i="oninputCapture"),o[i]=c}}r=="select"&&o.multiple&&Array.isArray(o.value)&&(o.value=L(n.children).forEach(function(d){d.props.selected=o.value.indexOf(d.props.value)!=-1})),r=="select"&&o.defaultValue!=null&&(o.value=L(n.children).forEach(function(d){d.props.selected=o.multiple?o.defaultValue.indexOf(d.props.value)!=-1:o.defaultValue==d.props.value})),n.class&&!n.className?(o.class=n.class,Object.defineProperty(o,"className",Zs)):(n.className&&!n.class||n.class&&n.className)&&(o.class=o.className=n.className),e.props=o}(t),t.$$typeof=sr,Tt&&Tt(t)};var Ot=y.__r;y.__r=function(t){Ot&&Ot(t),ot=t.__c};var Nt=y.diffed;y.diffed=function(t){Nt&&Nt(t);var e=t.props,n=t.__e;n!=null&&t.type==="textarea"&&"value"in e&&e.value!==n.value&&(n.value=e.value==null?"":e.value),ot=null};var lr={ReactCurrentDispatcher:{current:{readContext:function(t){return ot.__n[t.__c].props.value}}}},Xs="17.0.2";function ur(t){return N.bind(null,t)}function it(t){return!!t&&t.$$typeof===sr}function _r(t){return it(t)?Us.apply(null,arguments):t}function dr(t){return!!t.__k&&(ee(null,t),!0)}function fr(t){return t&&(t.base||t.nodeType===1&&t)||null}var hr=function(t,e){return t(e)},pr=function(t,e){return t(e)},mr=A;function st(t){t()}function gr(t){return t}function vr(){return[!1,st]}var yr=oe;function wr(t,e){var n=e(),r=we({h:{__:n,v:e}}),o=r[0].h,i=r[1];return oe(function(){o.__=n,o.v=e,Se(o.__,e())||i({h:o})},[t,n,e]),nt(function(){return Se(o.__,o.v())||i({h:o}),t(function(){Se(o.__,o.v())||i({h:o})})},[t]),n}var ea={useState:we,useId:Gn,useReducer:tt,useEffect:nt,useLayoutEffect:oe,useInsertionEffect:yr,useTransition:vr,useDeferredValue:gr,useSyncExternalStore:wr,startTransition:st,useRef:Fn,useImperativeHandle:zn,useMemo:be,useCallback:Qn,useContext:Vn,useDebugValue:Jn,version:"17.0.2",Children:er,render:ar,hydrate:cr,unmountComponentAtNode:dr,createPortal:ir,createElement:N,createContext:Wn,createFactory:ur,cloneElement:_r,createRef:Mn,Fragment:A,isValidElement:it,findDOMNode:fr,Component:O,PureComponent:fe,memo:Zn,forwardRef:Xn,flushSync:pr,unstable_batchedUpdates:hr,StrictMode:mr,Suspense:K,SuspenseList:F,lazy:or,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:lr};const ta=Object.freeze(Object.defineProperty({__proto__:null,Children:er,Component:O,Fragment:A,PureComponent:fe,StrictMode:mr,Suspense:K,SuspenseList:F,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:lr,cloneElement:_r,createContext:Wn,createElement:N,createFactory:ur,createPortal:ir,createRef:Mn,default:ea,findDOMNode:fr,flushSync:pr,forwardRef:Xn,hydrate:cr,isValidElement:it,lazy:or,memo:Zn,render:ar,startTransition:st,unmountComponentAtNode:dr,unstable_batchedUpdates:hr,useCallback:Qn,useContext:Vn,useDebugValue:Jn,useDeferredValue:gr,useEffect:nt,useErrorBoundary:$s,useId:Gn,useImperativeHandle:zn,useInsertionEffect:yr,useLayoutEffect:oe,useMemo:be,useReducer:tt,useRef:Fn,useState:we,useSyncExternalStore:wr,useTransition:vr,version:Xs},Symbol.toStringTag,{value:"Module"})),na=qt(ta);function br(t){return t&&typeof t=="object"&&"default"in t?t.default:t}var R=Ss,kr=br(oo),ra=br(Ns),f=na;function oa(t){kr.toString(t,{type:"terminal"}).then(console.log)}var ia=`:root {
  --animation-duration: 300ms;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.animated {
  animation-duration: var(--animation-duration);
  animation-fill-mode: both;
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}

#walletconnect-wrapper {
  -webkit-user-select: none;
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  user-select: none;
  width: 100%;
  z-index: 99999999999999;
}

.walletconnect-modal__headerLogo {
  height: 21px;
}

.walletconnect-modal__header p {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  align-items: flex-start;
  display: flex;
  flex: 1;
  margin-left: 5px;
}

.walletconnect-modal__close__wrapper {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10000;
  background: white;
  border-radius: 26px;
  padding: 6px;
  box-sizing: border-box;
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.walletconnect-modal__close__icon {
  position: relative;
  top: 7px;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
}

.walletconnect-modal__close__line1 {
  position: absolute;
  width: 100%;
  border: 1px solid rgb(48, 52, 59);
}

.walletconnect-modal__close__line2 {
  position: absolute;
  width: 100%;
  border: 1px solid rgb(48, 52, 59);
  transform: rotate(90deg);
}

.walletconnect-qrcode__base {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background: rgba(37, 41, 46, 0.95);
  height: 100%;
  left: 0;
  pointer-events: auto;
  position: fixed;
  top: 0;
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  width: 100%;
  will-change: opacity;
  padding: 40px;
  box-sizing: border-box;
}

.walletconnect-qrcode__text {
  color: rgba(60, 66, 82, 0.6);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1875em;
  margin: 10px 0 20px 0;
  text-align: center;
  width: 100%;
}

@media only screen and (max-width: 768px) {
  .walletconnect-qrcode__text {
    font-size: 4vw;
  }
}

@media only screen and (max-width: 320px) {
  .walletconnect-qrcode__text {
    font-size: 14px;
  }
}

.walletconnect-qrcode__image {
  width: calc(100% - 30px);
  box-sizing: border-box;
  cursor: none;
  margin: 0 auto;
}

.walletconnect-qrcode__notification {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.1s ease-in-out;
  background: white;
  color: black;
  margin-bottom: -60px;
  opacity: 0;
}

.walletconnect-qrcode__notification.notification__show {
  opacity: 1;
}

@media only screen and (max-width: 768px) {
  .walletconnect-modal__header {
    height: 130px;
  }
  .walletconnect-modal__base {
    overflow: auto;
  }
}

@media only screen and (min-device-width: 415px) and (max-width: 768px) {
  #content {
    max-width: 768px;
    box-sizing: border-box;
  }
}

@media only screen and (min-width: 375px) and (max-width: 415px) {
  #content {
    max-width: 414px;
    box-sizing: border-box;
  }
}

@media only screen and (min-width: 320px) and (max-width: 375px) {
  #content {
    max-width: 375px;
    box-sizing: border-box;
  }
}

@media only screen and (max-width: 320px) {
  #content {
    max-width: 320px;
    box-sizing: border-box;
  }
}

.walletconnect-modal__base {
  -webkit-font-smoothing: antialiased;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 50px 5px rgba(0, 0, 0, 0.4);
  font-family: ui-rounded, "SF Pro Rounded", "SF Pro Text", medium-content-sans-serif-font,
    -apple-system, BlinkMacSystemFont, ui-sans-serif, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Open Sans", "Helvetica Neue", sans-serif;
  margin-top: 41px;
  padding: 24px 24px 22px;
  pointer-events: auto;
  position: relative;
  text-align: center;
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  will-change: transform;
  overflow: visible;
  transform: translateY(-50%);
  top: 50%;
  max-width: 500px;
  margin: auto;
}

@media only screen and (max-width: 320px) {
  .walletconnect-modal__base {
    padding: 24px 12px;
  }
}

.walletconnect-modal__base .hidden {
  transform: translateY(150%);
  transition: 0.125s cubic-bezier(0.4, 0, 1, 1);
}

.walletconnect-modal__header {
  align-items: center;
  display: flex;
  height: 26px;
  left: 0;
  justify-content: space-between;
  position: absolute;
  top: -42px;
  width: 100%;
}

.walletconnect-modal__base .wc-logo {
  align-items: center;
  display: flex;
  height: 26px;
  margin-top: 15px;
  padding-bottom: 15px;
  pointer-events: auto;
}

.walletconnect-modal__base .wc-logo div {
  background-color: #3399ff;
  height: 21px;
  margin-right: 5px;
  mask-image: url("images/wc-logo.svg") center no-repeat;
  width: 32px;
}

.walletconnect-modal__base .wc-logo p {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.walletconnect-modal__base h2 {
  color: rgba(60, 66, 82, 0.6);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1875em;
  margin: 0 0 19px 0;
  text-align: center;
  width: 100%;
}

.walletconnect-modal__base__row {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  align-items: center;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  height: 56px;
  justify-content: space-between;
  padding: 0 15px;
  position: relative;
  margin: 0px 0px 8px;
  text-align: left;
  transition: 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  text-decoration: none;
}

.walletconnect-modal__base__row:hover {
  background: rgba(60, 66, 82, 0.06);
}

.walletconnect-modal__base__row:active {
  background: rgba(60, 66, 82, 0.06);
  transform: scale(0.975);
  transition: 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.walletconnect-modal__base__row__h3 {
  color: #25292e;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  padding-bottom: 3px;
}

.walletconnect-modal__base__row__right {
  align-items: center;
  display: flex;
  justify-content: center;
}

.walletconnect-modal__base__row__right__app-icon {
  border-radius: 8px;
  height: 34px;
  margin: 0 11px 2px 0;
  width: 34px;
  background-size: 100%;
  box-shadow: 0 4px 12px 0 rgba(37, 41, 46, 0.25);
}

.walletconnect-modal__base__row__right__caret {
  height: 18px;
  opacity: 0.3;
  transition: 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: 8px;
  will-change: opacity;
}

.walletconnect-modal__base__row:hover .caret,
.walletconnect-modal__base__row:active .caret {
  opacity: 0.6;
}

.walletconnect-modal__mobile__toggle {
  width: 80%;
  display: flex;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 18px;
  background: #d4d5d9;
}

.walletconnect-modal__single_wallet {
  display: flex;
  justify-content: center;
  margin-top: 7px;
  margin-bottom: 18px;
}

.walletconnect-modal__single_wallet a {
  cursor: pointer;
  color: rgb(64, 153, 255);
  font-size: 21px;
  font-weight: 800;
  text-decoration: none !important;
  margin: 0 auto;
}

.walletconnect-modal__mobile__toggle_selector {
  width: calc(50% - 8px);
  background: white;
  position: absolute;
  border-radius: 5px;
  height: calc(100% - 8px);
  top: 4px;
  transition: all 0.2s ease-in-out;
  transform: translate3d(4px, 0, 0);
}

.walletconnect-modal__mobile__toggle.right__selected .walletconnect-modal__mobile__toggle_selector {
  transform: translate3d(calc(100% + 12px), 0, 0);
}

.walletconnect-modal__mobile__toggle a {
  font-size: 12px;
  width: 50%;
  text-align: center;
  padding: 8px;
  margin: 0;
  font-weight: 600;
  z-index: 1;
}

.walletconnect-modal__footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media only screen and (max-width: 768px) {
  .walletconnect-modal__footer {
    margin-top: 5vw;
  }
}

.walletconnect-modal__footer a {
  cursor: pointer;
  color: #898d97;
  font-size: 15px;
  margin: 0 auto;
}

@media only screen and (max-width: 320px) {
  .walletconnect-modal__footer a {
    font-size: 14px;
  }
}

.walletconnect-connect__buttons__wrapper {
  max-height: 44vh;
}

.walletconnect-connect__buttons__wrapper__android {
  margin: 50% 0;
}

.walletconnect-connect__buttons__wrapper__wrap {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 10px 0;
}

@media only screen and (min-width: 768px) {
  .walletconnect-connect__buttons__wrapper__wrap {
    margin-top: 40px;
  }
}

.walletconnect-connect__button {
  background-color: rgb(64, 153, 255);
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: rgb(255, 255, 255);
  font-weight: 500;
}

.walletconnect-connect__button__icon_anchor {
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 8px;
  width: 42px;
  justify-self: center;
  flex-direction: column;
  text-decoration: none !important;
}

@media only screen and (max-width: 320px) {
  .walletconnect-connect__button__icon_anchor {
    margin: 4px;
  }
}

.walletconnect-connect__button__icon {
  border-radius: 10px;
  height: 42px;
  margin: 0;
  width: 42px;
  background-size: cover !important;
  box-shadow: 0 4px 12px 0 rgba(37, 41, 46, 0.25);
}

.walletconnect-connect__button__text {
  color: #424952;
  font-size: 2.7vw;
  text-decoration: none !important;
  padding: 0;
  margin-top: 1.8vw;
  font-weight: 600;
}

@media only screen and (min-width: 768px) {
  .walletconnect-connect__button__text {
    font-size: 16px;
    margin-top: 12px;
  }
}

.walletconnect-search__input {
  border: none;
  background: #d4d5d9;
  border-style: none;
  padding: 8px 16px;
  outline: none;
  font-style: normal;
  font-stretch: normal;
  font-size: 16px;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  border-radius: 8px;
  width: calc(100% - 16px);
  margin: 0;
  margin-bottom: 8px;
}
`;typeof Symbol<"u"&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")));typeof Symbol<"u"&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));function sa(t,e){try{var n=t()}catch(r){return e(r)}return n&&n.then?n.then(void 0,e):n}var aa="data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='300px' height='185px' viewBox='0 0 300 185' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E %3C!-- Generator: Sketch 49.3 (51167) - http://www.bohemiancoding.com/sketch --%3E %3Ctitle%3EWalletConnect%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='walletconnect-logo-alt' fill='%233B99FC' fill-rule='nonzero'%3E %3Cpath d='M61.4385429,36.2562612 C110.349767,-11.6319051 189.65053,-11.6319051 238.561752,36.2562612 L244.448297,42.0196786 C246.893858,44.4140867 246.893858,48.2961898 244.448297,50.690599 L224.311602,70.406102 C223.088821,71.6033071 221.106302,71.6033071 219.883521,70.406102 L211.782937,62.4749541 C177.661245,29.0669724 122.339051,29.0669724 88.2173582,62.4749541 L79.542302,70.9685592 C78.3195204,72.1657633 76.337001,72.1657633 75.1142214,70.9685592 L54.9775265,51.2530561 C52.5319653,48.8586469 52.5319653,44.9765439 54.9775265,42.5821357 L61.4385429,36.2562612 Z M280.206339,77.0300061 L298.128036,94.5769031 C300.573585,96.9713 300.573599,100.85338 298.128067,103.247793 L217.317896,182.368927 C214.872352,184.763353 210.907314,184.76338 208.461736,182.368989 C208.461726,182.368979 208.461714,182.368967 208.461704,182.368957 L151.107561,126.214385 C150.496171,125.615783 149.504911,125.615783 148.893521,126.214385 C148.893517,126.214389 148.893514,126.214393 148.89351,126.214396 L91.5405888,182.368927 C89.095052,184.763359 85.1300133,184.763399 82.6844276,182.369014 C82.6844133,182.369 82.684398,182.368986 82.6843827,182.36897 L1.87196327,103.246785 C-0.573596939,100.852377 -0.573596939,96.9702735 1.87196327,94.5758653 L19.7936929,77.028998 C22.2392531,74.6345898 26.2042918,74.6345898 28.6498531,77.028998 L86.0048306,133.184355 C86.6162214,133.782957 87.6074796,133.782957 88.2188704,133.184355 C88.2188796,133.184346 88.2188878,133.184338 88.2188969,133.184331 L145.571,77.028998 C148.016505,74.6345347 151.981544,74.6344449 154.427161,77.028798 C154.427195,77.0288316 154.427229,77.0288653 154.427262,77.028899 L211.782164,133.184331 C212.393554,133.782932 213.384814,133.782932 213.996204,133.184331 L271.350179,77.0300061 C273.79574,74.6355969 277.760778,74.6355969 280.206339,77.0300061 Z' id='WalletConnect'%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/svg%3E",ca="WalletConnect",la=300,ua="rgb(64, 153, 255)",Er="walletconnect-wrapper",Mt="walletconnect-style-sheet",Cr="walletconnect-qrcode-modal",_a="walletconnect-qrcode-close",Sr="walletconnect-qrcode-text",da="walletconnect-connect-button";function fa(t){return f.createElement("div",{className:"walletconnect-modal__header"},f.createElement("img",{src:aa,className:"walletconnect-modal__headerLogo"}),f.createElement("p",null,ca),f.createElement("div",{className:"walletconnect-modal__close__wrapper",onClick:t.onClose},f.createElement("div",{id:_a,className:"walletconnect-modal__close__icon"},f.createElement("div",{className:"walletconnect-modal__close__line1"}),f.createElement("div",{className:"walletconnect-modal__close__line2"}))))}function ha(t){return f.createElement("a",{className:"walletconnect-connect__button",href:t.href,id:da+"-"+t.name,onClick:t.onClick,rel:"noopener noreferrer",style:{backgroundColor:t.color},target:"_blank"},t.name)}var pa="data:image/svg+xml,%3Csvg width='8' height='18' viewBox='0 0 8 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.586301 0.213898C0.150354 0.552968 0.0718197 1.18124 0.41089 1.61719L5.2892 7.88931C5.57007 8.25042 5.57007 8.75608 5.2892 9.11719L0.410889 15.3893C0.071819 15.8253 0.150353 16.4535 0.586301 16.7926C1.02225 17.1317 1.65052 17.0531 1.98959 16.6172L6.86791 10.3451C7.7105 9.26174 7.7105 7.74476 6.86791 6.66143L1.98959 0.38931C1.65052 -0.0466374 1.02225 -0.125172 0.586301 0.213898Z' fill='%233C4252'/%3E %3C/svg%3E";function ma(t){var e=t.color,n=t.href,r=t.name,o=t.logo,i=t.onClick;return f.createElement("a",{className:"walletconnect-modal__base__row",href:n,onClick:i,rel:"noopener noreferrer",target:"_blank"},f.createElement("h3",{className:"walletconnect-modal__base__row__h3"},r),f.createElement("div",{className:"walletconnect-modal__base__row__right"},f.createElement("div",{className:"walletconnect-modal__base__row__right__app-icon",style:{background:"url('"+o+"') "+e,backgroundSize:"100%"}}),f.createElement("img",{src:pa,className:"walletconnect-modal__base__row__right__caret"})))}function ga(t){var e=t.color,n=t.href,r=t.name,o=t.logo,i=t.onClick,c=window.innerWidth<768?(r.length>8?2.5:2.7)+"vw":"inherit";return f.createElement("a",{className:"walletconnect-connect__button__icon_anchor",href:n,onClick:i,rel:"noopener noreferrer",target:"_blank"},f.createElement("div",{className:"walletconnect-connect__button__icon",style:{background:"url('"+o+"') "+e,backgroundSize:"100%"}}),f.createElement("div",{style:{fontSize:c},className:"walletconnect-connect__button__text"},r))}var va=5,xe=12;function ya(t){var e=R.isAndroid(),n=f.useState(""),r=n[0],o=n[1],i=f.useState(""),c=i[0],l=i[1],d=f.useState(1),p=d[0],s=d[1],w=c?t.links.filter(function(_){return _.name.toLowerCase().includes(c.toLowerCase())}):t.links,g=t.errorMessage,m=c||w.length>va,k=Math.ceil(w.length/xe),I=[(p-1)*xe+1,p*xe],C=w.length?w.filter(function(_,v){return v+1>=I[0]&&v+1<=I[1]}):[],a=!e&&k>1,u=void 0;function h(_){o(_.target.value),clearTimeout(u),_.target.value?u=setTimeout(function(){l(_.target.value),s(1)},1e3):(o(""),l(""),s(1))}return f.createElement("div",null,f.createElement("p",{id:Sr,className:"walletconnect-qrcode__text"},e?t.text.connect_mobile_wallet:t.text.choose_preferred_wallet),!e&&f.createElement("input",{className:"walletconnect-search__input",placeholder:"Search",value:r,onChange:h}),f.createElement("div",{className:"walletconnect-connect__buttons__wrapper"+(e?"__android":m&&w.length?"__wrap":"")},e?f.createElement(ha,{name:t.text.connect,color:ua,href:t.uri,onClick:f.useCallback(function(){R.saveMobileLinkInfo({name:"Unknown",href:t.uri})},[])}):C.length?C.map(function(_){var v=_.color,E=_.name,b=_.shortName,S=_.logo,T=R.formatIOSMobile(t.uri,_),W=f.useCallback(function(){R.saveMobileLinkInfo({name:E,href:T})},[C]);return m?f.createElement(ga,{color:v,href:T,name:b||E,logo:S,onClick:W}):f.createElement(ma,{color:v,href:T,name:E,logo:S,onClick:W})}):f.createElement(f.Fragment,null,f.createElement("p",null,g.length?t.errorMessage:t.links.length&&!w.length?t.text.no_wallets_found:t.text.loading))),a&&f.createElement("div",{className:"walletconnect-modal__footer"},Array(k).fill(0).map(function(_,v){var E=v+1,b=p===E;return f.createElement("a",{style:{margin:"auto 10px",fontWeight:b?"bold":"normal"},onClick:function(){return s(E)}},E)})))}function wa(t){var e=!!t.message.trim();return f.createElement("div",{className:"walletconnect-qrcode__notification"+(e?" notification__show":"")},t.message)}var ba=function(t){try{var e="";return Promise.resolve(kr.toString(t,{margin:0,type:"svg"})).then(function(n){return typeof n=="string"&&(e=n.replace("<svg",'<svg class="walletconnect-qrcode__image"')),e})}catch(n){return Promise.reject(n)}};function ka(t){var e=f.useState(""),n=e[0],r=e[1],o=f.useState(""),i=o[0],c=o[1];f.useEffect(function(){try{return Promise.resolve(ba(t.uri)).then(function(d){c(d)})}catch(d){Promise.reject(d)}},[]);var l=function(){var d=ra(t.uri);d?(r(t.text.copied_to_clipboard),setInterval(function(){return r("")},1200)):(r("Error"),setInterval(function(){return r("")},1200))};return f.createElement("div",null,f.createElement("p",{id:Sr,className:"walletconnect-qrcode__text"},t.text.scan_qrcode_with_wallet),f.createElement("div",{dangerouslySetInnerHTML:{__html:i}}),f.createElement("div",{className:"walletconnect-modal__footer"},f.createElement("a",{onClick:l},t.text.copy_to_clipboard)),f.createElement(wa,{message:n}))}function Ea(t){var e=R.isAndroid(),n=R.isMobile(),r=n?t.qrcodeModalOptions&&t.qrcodeModalOptions.mobileLinks?t.qrcodeModalOptions.mobileLinks:void 0:t.qrcodeModalOptions&&t.qrcodeModalOptions.desktopLinks?t.qrcodeModalOptions.desktopLinks:void 0,o=f.useState(!1),i=o[0],c=o[1],l=f.useState(!1),d=l[0],p=l[1],s=f.useState(!n),w=s[0],g=s[1],m={mobile:n,text:t.text,uri:t.uri,qrcodeModalOptions:t.qrcodeModalOptions},k=f.useState(""),I=k[0],C=k[1],a=f.useState(!1),u=a[0],h=a[1],_=f.useState([]),v=_[0],E=_[1],b=f.useState(""),S=b[0],T=b[1],W=function(){d||i||r&&!r.length||v.length>0||f.useEffect(function(){var Tr=function(){try{if(e)return Promise.resolve();c(!0);var ke=sa(function(){var G=t.qrcodeModalOptions&&t.qrcodeModalOptions.registryUrl?t.qrcodeModalOptions.registryUrl:R.getWalletRegistryUrl();return Promise.resolve(fetch(G)).then(function(Or){return Promise.resolve(Or.json()).then(function(Nr){var Mr=Nr.listings,Lr=n?"mobile":"desktop",ie=R.getMobileLinkRegistry(R.formatMobileRegistry(Mr,Lr),r);c(!1),p(!0),T(ie.length?"":t.text.no_supported_wallets),E(ie);var at=ie.length===1;at&&(C(R.formatIOSMobile(t.uri,ie[0])),g(!0)),h(at)})})},function(G){c(!1),p(!0),T(t.text.something_went_wrong),console.error(G)});return Promise.resolve(ke&&ke.then?ke.then(function(){}):void 0)}catch(G){return Promise.reject(G)}};Tr()})};W();var Rr=n?w:!w;return f.createElement("div",{id:Cr,className:"walletconnect-qrcode__base animated fadeIn"},f.createElement("div",{className:"walletconnect-modal__base"},f.createElement(fa,{onClose:t.onClose}),u&&w?f.createElement("div",{className:"walletconnect-modal__single_wallet"},f.createElement("a",{onClick:function(){return R.saveMobileLinkInfo({name:v[0].name,href:I})},href:I,rel:"noopener noreferrer",target:"_blank"},t.text.connect_with+" "+(u?v[0].name:"")+" ›")):e||i||!i&&v.length?f.createElement("div",{className:"walletconnect-modal__mobile__toggle"+(Rr?" right__selected":"")},f.createElement("div",{className:"walletconnect-modal__mobile__toggle_selector"}),n?f.createElement(f.Fragment,null,f.createElement("a",{onClick:function(){return g(!1),W()}},t.text.mobile),f.createElement("a",{onClick:function(){return g(!0)}},t.text.qrcode)):f.createElement(f.Fragment,null,f.createElement("a",{onClick:function(){return g(!0)}},t.text.qrcode),f.createElement("a",{onClick:function(){return g(!1),W()}},t.text.desktop))):null,f.createElement("div",null,w||!e&&!i&&!v.length?f.createElement(ka,Object.assign({},m)):f.createElement(ya,Object.assign({},m,{links:v,errorMessage:S})))))}var Ca={choose_preferred_wallet:"Wähle bevorzugte Wallet",connect_mobile_wallet:"Verbinde mit Mobile Wallet",scan_qrcode_with_wallet:"Scanne den QR-code mit einer WalletConnect kompatiblen Wallet",connect:"Verbinden",qrcode:"QR-Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"In die Zwischenablage kopieren",copied_to_clipboard:"In die Zwischenablage kopiert!",connect_with:"Verbinden mit Hilfe von",loading:"Laden...",something_went_wrong:"Etwas ist schief gelaufen",no_supported_wallets:"Es gibt noch keine unterstützten Wallet",no_wallets_found:"keine Wallet gefunden"},Sa={choose_preferred_wallet:"Choose your preferred wallet",connect_mobile_wallet:"Connect to Mobile Wallet",scan_qrcode_with_wallet:"Scan QR code with a WalletConnect-compatible wallet",connect:"Connect",qrcode:"QR Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"Copy to clipboard",copied_to_clipboard:"Copied to clipboard!",connect_with:"Connect with",loading:"Loading...",something_went_wrong:"Something went wrong",no_supported_wallets:"There are no supported wallets yet",no_wallets_found:"No wallets found"},xa={choose_preferred_wallet:"Elige tu billetera preferida",connect_mobile_wallet:"Conectar a billetera móvil",scan_qrcode_with_wallet:"Escanea el código QR con una billetera compatible con WalletConnect",connect:"Conectar",qrcode:"Código QR",mobile:"Móvil",desktop:"Desktop",copy_to_clipboard:"Copiar",copied_to_clipboard:"Copiado!",connect_with:"Conectar mediante",loading:"Cargando...",something_went_wrong:"Algo salió mal",no_supported_wallets:"Todavía no hay billeteras compatibles",no_wallets_found:"No se encontraron billeteras"},Ia={choose_preferred_wallet:"Choisissez votre portefeuille préféré",connect_mobile_wallet:"Se connecter au portefeuille mobile",scan_qrcode_with_wallet:"Scannez le QR code avec un portefeuille compatible WalletConnect",connect:"Se connecter",qrcode:"QR Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"Copier",copied_to_clipboard:"Copié!",connect_with:"Connectez-vous à l'aide de",loading:"Chargement...",something_went_wrong:"Quelque chose a mal tourné",no_supported_wallets:"Il n'y a pas encore de portefeuilles pris en charge",no_wallets_found:"Aucun portefeuille trouvé"},Ra={choose_preferred_wallet:"원하는 지갑을 선택하세요",connect_mobile_wallet:"모바일 지갑과 연결",scan_qrcode_with_wallet:"WalletConnect 지원 지갑에서 QR코드를 스캔하세요",connect:"연결",qrcode:"QR 코드",mobile:"모바일",desktop:"데스크탑",copy_to_clipboard:"클립보드에 복사",copied_to_clipboard:"클립보드에 복사되었습니다!",connect_with:"와 연결하다",loading:"로드 중...",something_went_wrong:"문제가 발생했습니다.",no_supported_wallets:"아직 지원되는 지갑이 없습니다",no_wallets_found:"지갑을 찾을 수 없습니다"},Ta={choose_preferred_wallet:"Escolha sua carteira preferida",connect_mobile_wallet:"Conectar-se à carteira móvel",scan_qrcode_with_wallet:"Ler o código QR com uma carteira compatível com WalletConnect",connect:"Conectar",qrcode:"Código QR",mobile:"Móvel",desktop:"Desktop",copy_to_clipboard:"Copiar",copied_to_clipboard:"Copiado!",connect_with:"Ligar por meio de",loading:"Carregamento...",something_went_wrong:"Algo correu mal",no_supported_wallets:"Ainda não há carteiras suportadas",no_wallets_found:"Nenhuma carteira encontrada"},Oa={choose_preferred_wallet:"选择你的钱包",connect_mobile_wallet:"连接至移动端钱包",scan_qrcode_with_wallet:"使用兼容 WalletConnect 的钱包扫描二维码",connect:"连接",qrcode:"二维码",mobile:"移动",desktop:"桌面",copy_to_clipboard:"复制到剪贴板",copied_to_clipboard:"复制到剪贴板成功！",connect_with:"通过以下方式连接",loading:"正在加载...",something_went_wrong:"出了问题",no_supported_wallets:"目前还没有支持的钱包",no_wallets_found:"没有找到钱包"},Na={choose_preferred_wallet:"کیف پول مورد نظر خود را انتخاب کنید",connect_mobile_wallet:"به کیف پول موبایل وصل شوید",scan_qrcode_with_wallet:"کد QR را با یک کیف پول سازگار با WalletConnect اسکن کنید",connect:"اتصال",qrcode:"کد QR",mobile:"سیار",desktop:"دسکتاپ",copy_to_clipboard:"کپی به کلیپ بورد",copied_to_clipboard:"در کلیپ بورد کپی شد!",connect_with:"ارتباط با",loading:"...بارگذاری",something_went_wrong:"مشکلی پیش آمد",no_supported_wallets:"هنوز هیچ کیف پول پشتیبانی شده ای وجود ندارد",no_wallets_found:"هیچ کیف پولی پیدا نشد"},Lt={de:Ca,en:Sa,es:xa,fr:Ia,ko:Ra,pt:Ta,zh:Oa,fa:Na};function Ma(){var t=R.getDocumentOrThrow(),e=t.getElementById(Mt);e&&t.head.removeChild(e);var n=t.createElement("style");n.setAttribute("id",Mt),n.innerText=ia,t.head.appendChild(n)}function La(){var t=R.getDocumentOrThrow(),e=t.createElement("div");return e.setAttribute("id",Er),t.body.appendChild(e),e}function xr(){var t=R.getDocumentOrThrow(),e=t.getElementById(Cr);e&&(e.className=e.className.replace("fadeIn","fadeOut"),setTimeout(function(){var n=t.getElementById(Er);n&&t.body.removeChild(n)},la))}function Aa(t){return function(){xr(),t&&t()}}function qa(){var t=R.getNavigatorOrThrow().language.split("-")[0]||"en";return Lt[t]||Lt.en}function Ua(t,e,n){Ma();var r=La();f.render(f.createElement(Ea,{text:qa(),uri:t,onClose:Aa(e),qrcodeModalOptions:n}),r)}function $a(){xr()}var Ir=function(){return typeof process<"u"&&typeof process.versions<"u"&&typeof process.versions.node<"u"};function Pa(t,e,n){console.log(t),Ir()?oa(t):Ua(t,e,n)}function Da(){Ir()||$a()}var Ha={open:Pa,close:Da},ja=Ha;const Wa=qe(ja);class Ba extends no{constructor(e){super(),this.events=new At,this.accounts=[],this.chainId=1,this.pending=!1,this.bridge="https://bridge.walletconnect.org",this.qrcode=!0,this.qrcodeModalOptions=void 0,this.opts=e,this.chainId=e?.chainId||this.chainId,this.wc=this.register(e)}get connected(){return typeof this.wc<"u"&&this.wc.connected}get connecting(){return this.pending}get connector(){return this.wc=this.register(this.opts),this.wc}on(e,n){this.events.on(e,n)}once(e,n){this.events.once(e,n)}off(e,n){this.events.off(e,n)}removeListener(e,n){this.events.removeListener(e,n)}async open(e){if(this.connected){this.onOpen();return}return new Promise((n,r)=>{this.on("error",o=>{r(o)}),this.on("open",()=>{n()}),this.create(e)})}async close(){typeof this.wc>"u"||(this.wc.connected&&this.wc.killSession(),this.onClose())}async send(e){this.wc=this.register(this.opts),this.connected||await this.open(),this.sendPayload(e).then(n=>this.events.emit("payload",n)).catch(n=>this.events.emit("payload",ct(e.id,n.message)))}register(e){if(this.wc)return this.wc;this.opts=e||this.opts,this.bridge=e?.connector?e.connector.bridge:e?.bridge||"https://bridge.walletconnect.org",this.qrcode=typeof e?.qrcode>"u"||e.qrcode!==!1,this.chainId=typeof e?.chainId<"u"?e.chainId:this.chainId,this.qrcodeModalOptions=e?.qrcodeModalOptions;const n={bridge:this.bridge,qrcodeModal:this.qrcode?Wa:void 0,qrcodeModalOptions:this.qrcodeModalOptions,storageId:e?.storageId,signingMethods:e?.signingMethods,clientMeta:e?.clientMeta};if(this.wc=typeof e?.connector<"u"?e.connector:new Cs(n),typeof this.wc>"u")throw new Error("Failed to register WalletConnect connector");return this.wc.accounts.length&&(this.accounts=this.wc.accounts),this.wc.chainId&&(this.chainId=this.wc.chainId),this.registerConnectorEvents(),this.wc}onOpen(e){this.pending=!1,e&&(this.wc=e),this.events.emit("open")}onClose(){this.pending=!1,this.wc&&(this.wc=void 0),this.events.emit("close")}onError(e,n="Failed or Rejected Request",r=-32e3){const o={id:e.id,jsonrpc:e.jsonrpc,error:{code:r,message:n}};return this.events.emit("payload",o),o}create(e){this.wc=this.register(this.opts),this.chainId=e||this.chainId,!(this.connected||this.pending)&&(this.pending=!0,this.registerConnectorEvents(),this.wc.createSession({chainId:this.chainId}).then(()=>this.events.emit("created")).catch(n=>this.events.emit("error",n)))}registerConnectorEvents(){this.wc=this.register(this.opts),this.wc.on("connect",e=>{var n,r;if(e){this.events.emit("error",e);return}this.accounts=((n=this.wc)===null||n===void 0?void 0:n.accounts)||[],this.chainId=((r=this.wc)===null||r===void 0?void 0:r.chainId)||this.chainId,this.onOpen()}),this.wc.on("disconnect",e=>{if(e){this.events.emit("error",e);return}this.onClose()}),this.wc.on("modal_closed",()=>{this.events.emit("error",new Error("User closed modal"))}),this.wc.on("session_update",(e,n)=>{const{accounts:r,chainId:o}=n.params[0];(!this.accounts||r&&this.accounts!==r)&&(this.accounts=r,this.events.emit("accountsChanged",r)),(!this.chainId||o&&this.chainId!==o)&&(this.chainId=o,this.events.emit("chainChanged",o))})}async sendPayload(e){this.wc=this.register(this.opts);try{const n=await this.wc.unsafeSend(e);return this.sanitizeResponse(n)}catch(n){return this.onError(e,n.message)}}sanitizeResponse(e){return typeof e.error<"u"&&typeof e.error.code>"u"?ct(e.id,e.error.message,e.error.data):e}}class Ya{constructor(e){this.events=new At,this.rpc={infuraId:e?.infuraId,custom:e?.rpc},this.signer=new lt(new Ba(e));const n=this.signer.connection.chainId||e?.chainId||1;this.http=this.setHttpProvider(n),this.registerEventListeners()}get connected(){return this.signer.connection.connected}get connector(){return this.signer.connection.connector}get accounts(){return this.signer.connection.accounts}get chainId(){return this.signer.connection.chainId}get rpcUrl(){var e;return((e=this.http)===null||e===void 0?void 0:e.connection).url||""}async request(e){switch(e.method){case"eth_requestAccounts":return await this.connect(),this.signer.connection.accounts;case"eth_accounts":return this.signer.connection.accounts;case"eth_chainId":return this.signer.connection.chainId}if(Ue.includes(e.method))return this.signer.request(e);if(typeof this.http>"u")throw new Error(`Cannot request JSON-RPC method (${e.method}) without provided rpc url`);return this.http.request(e)}sendAsync(e,n){this.request(e).then(r=>n(null,r)).catch(r=>n(r,void 0))}async enable(){return await this.request({method:"eth_requestAccounts"})}async connect(){this.signer.connection.connected||await this.signer.connect()}async disconnect(){this.signer.connection.connected&&await this.signer.disconnect()}on(e,n){this.events.on(e,n)}once(e,n){this.events.once(e,n)}removeListener(e,n){this.events.removeListener(e,n)}off(e,n){this.events.off(e,n)}get isWalletConnect(){return!0}registerEventListeners(){this.signer.connection.on("accountsChanged",e=>{this.events.emit("accountsChanged",e)}),this.signer.connection.on("chainChanged",e=>{this.http=this.setHttpProvider(e),this.events.emit("chainChanged",e)}),this.signer.on("disconnect",()=>{this.events.emit("disconnect")})}setHttpProvider(e){const n=cn(e,this.rpc);return typeof n>"u"?void 0:new lt(new ro(n))}}export{Ya as default};
