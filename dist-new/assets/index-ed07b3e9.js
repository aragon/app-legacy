import{y as c,u as h,eS as m,q as r,v as g,e$ as f}from"./main-1e616d6f.js";import{r as i}from"./tiptap-313d156f.js";const L=({wallets:t,tokenSymbol:o,onVoterClick:p=()=>{}})=>{const[n,u]=i.useState(""),{t:a}=h(),d=i.useCallback(e=>{if(n!==""){const s=new RegExp(n,"i");return e?.address?.match(s)||e?.ensName.match(s)}return!0},[n]),l=i.useMemo(()=>t?o?t.filter(d).map(({address:e,amount:s,ensName:x})=>({wallet:x||m(e,a),tokenAmount:`${s} ${o}`})):t.filter(d).map(({address:e,ensName:s})=>({wallet:s||e})):[],[d,t,a,o]);return r.jsxs(r.Fragment,{children:[r.jsx(b,{children:r.jsx(g,{value:n,placeholder:a("placeHolders.searchTokens"),onChange:e=>u(e.target.value)})}),r.jsx(v,{children:l?.length>0?r.jsx(f,{voters:l,...o&&{showAmount:!0},pageSize:l.length,LoadMoreLabel:a("community.votersTable.loadMore"),onVoterClick:p}):r.jsx("span",{children:a("AddressModal.noAddresses")})})]})},b=c.div.attrs({className:"p-3 bg-ui-0 rounded-xl sticky top-0"})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
  border-radius: 12px;
`,v=c.div.attrs({className:"p-3 max-h-96 overflow-auto"})``;export{L as F};
