import{y as a,u as v,g as q,R as te,b9 as I,ad as se,bG as ae,q as e,J as le,S as D,t as x,z as W,c1 as re,w as N,Y as H,ai as T,aj as A,c2 as oe,c3 as ne,c4 as ie,aU as ce,c5 as de,c6 as xe,c7 as pe,c8 as ue,A as S,aX as me,ax as ge,ab as fe,c9 as U,ca as he,e as be,ac as Ne,cb as ve}from"./main-1e616d6f.js";import{r as b}from"./tiptap-313d156f.js";import{C as je}from"./index-d73e132f.js";import{u as ye}from"./useResolveDaoAvatar-b536da94.js";import{G as Se}from"./circleGreenGradient-b1deebe9.js";import"./osx-ethers-780b73f3.js";const Ee=t=>{const{dao:s}=t,{name:n,daoAddress:i,logo:d,ens:c,description:g,network:r,pluginName:p}=s,{t:u}=v(),{isDesktop:f}=q(),{avatar:h}=ye(d),j=te(se,{network:r,dao:I(c)||i}),l=ae(j),y=u(p==="token-voting.plugin.dao.eth"||p==="token-voting-repo"?"explore.explorer.tokenBased":"explore.explorer.walletBased");return e.jsxs(we,{href:l,children:[e.jsxs(De,{children:[e.jsxs(ke,{children:[e.jsx(le,{daoName:n,src:d&&h}),e.jsxs("div",{className:"space-y-0.5 text-left xl:space-y-1",children:[e.jsx(Ce,{children:n}),e.jsx("p",{className:"font-semibold text-neutral-500 ft-text-sm",children:I(c)})]})]}),e.jsx(Te,{isDesktop:f,children:g})]}),e.jsxs(Ae,{children:[e.jsxs(G,{children:[e.jsx(D,{icon:x.BLOCKCHAIN_BLOCKCHAIN,className:"text-neutral-600"}),e.jsx(M,{children:W[r].name})]}),e.jsxs(G,{children:[e.jsx(D,{icon:x.APP_MEMBERS,className:"text-neutral-600"}),e.jsx(M,{children:y})]})]})]})},we=a.a.attrs({className:`p-4 xl:p-6 w-full flex flex-col space-y-6
    box-border border border-neutral-0
    focus:outline-none focus:ring focus:ring-primary
    hover:border-neutral-100 active:border-200
    bg-neutral-0 rounded-xl cursor-pointer
    `})`
  &:hover {
    box-shadow:
      0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06),
      0px 0px 1px rgba(31, 41, 51, 0.04);
  }
  &:focus {
    box-shadow: 0px 0px 0px 2px #003bf5;
  }
`,ke=a.div.attrs({className:"flex flex-row space-x-4 items-center"})``,Ce=a.p.attrs({className:"font-semibold text-neutral-800 ft-text-xl break-words"})``,Te=a.p.attrs({className:`
  font-medium text-neutral-600 ft-text-base flex text-left
  `})`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${t=>t.isDesktop?2:3};
`,Ae=a.div.attrs({className:"flex flex-row space-x-6"})``,M=a.p.attrs({className:"text-neutral-600 ft-text-sm capitalize"})``,G=a.div.attrs({className:"flex flex-row space-x-2"})``,De=a.div.attrs({className:"flex flex-col grow space-y-3 flex-1"})``,_=Object.entries(W).flatMap(([t,{name:s,isTestnet:n}])=>{const i=t;return re.includes(i)?[]:i!=="goerli"&&i!=="unsupported"?{label:s,value:i,testnet:n}:[]}),Le=[{label:"explore.modal.filterDAOs.label.tokenVoting",value:"token-voting-repo"},{label:"explore.modal.filterDAOs.label.member",value:"multisig-repo"}],z=[{label:"explore.toggleFilter.allDAOs",value:"allDaos"},{label:"explore.toggleFilter.member",value:"memberOf"},{label:"explore.toggleFilter.Favourites",value:"following"}];var m=(t=>(t.SET_PLUGIN_NAMES="SET_PLUGIN_NAMES",t.SET_QUICK_FILTER="SET_QUICK_FILTER",t.SET_NETWORKS="SET_NETWORKS",t.SET_ORDER="SET_ORDER",t.TOGGLE_TESTNETS="TOGGLE_TESTNETS",t.RESET="RESET",t))(m||{});const _e=(t,s)=>{switch(s.type){case"SET_PLUGIN_NAMES":return{...t,pluginNames:s.payload};case"SET_QUICK_FILTER":return{...t,quickFilter:s.payload};case"SET_NETWORKS":return{...t,networks:s.payload};case"RESET":return{...s.payload};case"TOGGLE_TESTNETS":return{...t,showTestnets:s.payload};case"SET_ORDER":return{...t,order:s.payload};default:return t}},E={quickFilter:"allDaos",pluginNames:[],networks:[],order:"tvl",showTestnets:!1},Oe=({isOpen:t,filters:s,onClose:n,onFilterChange:i,totalCount:d,daoListLoading:c})=>{const{isDesktop:g}=q(),r=s.quickFilter===E.quickFilter&&!s.networks?.length&&!s.pluginNames?.length,p=g?Ke:ne;return e.jsxs(p,{isOpen:t,onClose:n,children:[e.jsx(Re,{onClose:n}),e.jsx(Fe,{filters:s,onFilterChange:i}),e.jsx(Ie,{count:d??0,onClose:n,showAll:r,isLoading:c,onFilterChange:i})]})},Re=({onClose:t})=>{const{t:s}=v();return e.jsxs(Pe,{children:[e.jsx("p",{className:"flex-1 font-semibold text-neutral-600 ft-text-lg",children:s("explore.modal.filterDAOs.title")}),e.jsx(N,{iconLeft:x.CLOSE,variant:"tertiary",size:"sm",responsiveSize:{lg:"lg"},onClick:t})]})},Fe=({filters:{networks:t,quickFilter:s,pluginNames:n,showTestnets:i},onFilterChange:d})=>{const{t:c}=v(),{isConnected:g}=H(),r=_.flatMap(l=>l.testnet?l.value:[]),p=i?_:_.filter(l=>!l.testnet),u=l=>{l&&!Array.isArray(l)&&d({type:m.SET_QUICK_FILTER,payload:l})},f=l=>{d({type:m.SET_NETWORKS,payload:l})},h=l=>{if(l===!1){const y=t?.filter(w=>!r.includes(w));d({type:m.SET_NETWORKS,payload:y})}d({type:m.TOGGLE_TESTNETS,payload:l})},j=l=>{d({type:m.SET_PLUGIN_NAMES,payload:l})};return e.jsxs(Me,{children:[e.jsx(O,{children:e.jsx(T,{isMultiSelect:!1,value:s,onChange:u,children:z.map(l=>e.jsx(A,{label:c(l.label),value:l.value,disabled:(l.value==="memberOf"||l.value==="following")&&!g},l.value))})}),e.jsxs(O,{children:[e.jsxs(P,{children:[e.jsxs(K,{children:[e.jsx(D,{icon:x.BLOCKCHAIN_BLOCKCHAIN}),e.jsx($,{children:c("explore.modal.filterDAOs.label.blockchains")})]}),e.jsx(B,{})]}),e.jsx(T,{isMultiSelect:!0,value:t,onChange:f,children:p.flatMap(l=>e.jsx(A,{label:c(l.label),value:l.value},l.value))}),e.jsx(oe,{checked:i,onCheckedChanged:h,label:c("explore.modal.filterDAOS.label.showTesnets")})]}),e.jsxs(O,{children:[e.jsxs(P,{children:[e.jsxs(K,{children:[e.jsx(D,{icon:x.APP_PROPOSALS}),e.jsx($,{children:c("explore.modal.filterDAOs.label.governanceType")})]}),e.jsx(B,{})]}),e.jsx(T,{isMultiSelect:!0,onChange:j,value:n,children:Le.map(l=>e.jsx(A,{label:c(l.label),value:l.value},l.value))})]})]})},Ie=t=>{const{t:s}=v();let n,i=!1;t.isLoading?n=s("explore.modal.filterDAOs.ctaLoading"):t.showAll?n=s("explore.modal.filterDAOs.ctaLabel.seeAll"):t.count===0?(n=s("explore.modal.filterDAOs.ctaLabel.see0"),i=!0):n=s("explore.modal.filterDAOs.ctaLabel.see{{amount}}",{amount:t.count});const d=()=>{!t.isLoading&&!i&&t.onClose()},c=()=>{t.onFilterChange({type:m.RESET,payload:E})};return e.jsxs(Ge,{children:[e.jsx(N,{size:"lg",variant:"primary",isLoading:t.isLoading,disabled:i,onClick:d,children:n}),e.jsx(N,{size:"lg",variant:"tertiary",onClick:c,iconLeft:x.RELOAD,className:"w-full lg:w-auto",children:s("explore.modal.filterDAOs.buttonLabel.clearFilters")})]})},O=a.div.attrs({className:"space-y-3 lg:space-y-4"})``,Me=a.div.attrs({className:"py-6 px-4 space-y-6 lg:space-y-10 lg:px-6"})``,Ge=a.div.attrs({className:"gap-y-3 border-t border-neutral-100 p-4 lg:px-6 flex flex-col lg:flex-row lg:gap-x-4 lg:border-none"})``,P=a.div.attrs({className:"flex items-center gap-x-6"})``,K=a.div.attrs({className:"flex items-center gap-x-2 text-neutral-400"})``,$=a.span.attrs({className:"text-neutral-600 truncate text-sm leading-tight lg:text-base"})``,B=a.div.attrs({className:"h-0.25 flex-1 bg-neutral-100"})``,Pe=a.div.attrs({className:`flex items-center space-x-3 lg:space-x-4 rounded-2xl bg-neutral-0 p-4 lg:px-6 lg:rounded-[0px] lg:shadow-none
    shadow-[0px_4px_8px_rgba(31,41,51,0.04),_0px_0px_2px_rgba(31,41,51,0.06),_0px_0px_1px_rgba(31,41,51,0.04)]`})``,Ke=a(ie).attrs({style:{position:"fixed",display:"flex",flexDirection:"column",top:"40%",left:"50%",transform:"translate(-50%, -50%)",borderRadius:12,width:"720px",outline:"none",overflow:"auto",boxShadow:`0px 24px 32px rgba(31, 41, 51, 0.04),
       0px 16px 24px rgba(31, 41, 51, 0.04),
       0px 4px 8px rgba(31, 41, 51, 0.04),
       0px 0px 1px rgba(31, 41, 51, 0.04)`}})``;var Q=(t=>(t.ASC="ASC",t.DESC="DESC",t))(Q||{});const $e=ce.gql`
  query Daos(
    $pluginNames: [String!]
    $orderBy: String
    $skip: Float
    $direction: OrderDirection
    $networks: [Network!]
    $take: Float
    $memberAddress: String
  ) {
    daos(
      pluginNames: $pluginNames
      direction: $direction
      orderBy: $orderBy
      networks: $networks
      take: $take
      skip: $skip
      memberAddress: $memberAddress
    ) {
      data {
        createdAt
        creatorAddress
        daoAddress
        description
        ens
        logo
        name
        network
        pluginName
        stats {
          members
          proposalsCreated
          proposalsExecuted
          tvl
          votes
          uniqueVoters
        }
      }
      skip
      total
      take
    }
  }
`,Be=async t=>{const{daos:s}=await pe("https://app-backend.aragon.org/graphql",$e,t);return s},qe=(t,s={})=>de(xe.daos(t),({pageParam:n})=>Be({...t,...n}),{...s,getNextPageParam:n=>{const{skip:i,total:d,take:c}=n;if(i+c<d)return{...t,skip:i+c}}}),We=t=>({creatorAddress:"",daoAddress:t.address,ens:t.ensDomain,network:fe(t.chain),name:t.metadata.name,description:t.metadata.description??"",logo:t.metadata.avatar??"",createdAt:"",pluginName:t.plugins[0].id}),He=()=>{const{t}=v(),{isConnected:s,address:n}=H(),[i,d]=b.useState(!1),[c,g]=b.useState(!1),[r,p]=b.useReducer(_e,E),u=r.quickFilter==="following"&&s,f=ue({pluginNames:r.pluginNames,networks:r.networks},{enabled:u}),h=qe({direction:Q.DESC,orderBy:r.order,...r.pluginNames?.length!==0&&{pluginNames:r.pluginNames},...r.networks?.length!==0&&{networks:r.networks?.map(o=>o==="arbitrum-goerli"?"arbitrumGoerli":o==="base-goerli"?"baseGoerli":o)},...r.quickFilter==="memberOf"&&n?{memberAddress:n}:{}},{enabled:u===!1}),j=h.data?.pages.flatMap(o=>o.data),l=b.useMemo(()=>{let o=0;return r?(r.quickFilter!==E.quickFilter&&o++,r.pluginNames?.length!==0&&o++,r.networks?.length!==0&&o++,o!==0?o.toString():""):""},[r]),y=b.useMemo(()=>f.data?.pages.flatMap(o=>o.data.map(We))??[],[f.data]),w=u?y:j,{isLoading:L,hasNextPage:V,isFetchingNextPage:R,fetchNextPage:Y}=u?f:h,k=(u?f.data?.pages[0].total:h.data?.pages[0].total)??0,J=o=>{o&&!Array.isArray(o)&&p({type:m.SET_QUICK_FILTER,payload:o})},C=o=>{o&&p({type:m.SET_ORDER,payload:o})},F=w?.length??0,X=L===!1&&k===0,Z=()=>{p({type:m.RESET,payload:E})};return e.jsxs(ze,{children:[e.jsxs(Ue,{children:[e.jsx(Ve,{children:t("explore.explorer.title")}),e.jsxs(Ye,{children:[e.jsx(T,{isMultiSelect:!1,value:r.quickFilter,onChange:J,children:z.map(o=>e.jsx(A,{label:t(o.label),value:o.value,disabled:(o.value==="memberOf"||o.value==="following")&&!s},o.value))}),e.jsxs(Je,{children:[e.jsx(N,{variant:l!==""?"secondary":"tertiary",size:"md",className:"!min-w-fit",responsiveSize:{lg:"lg"},iconLeft:x.FILTER,onClick:()=>d(!0),children:l}),r.quickFilter!=="following"&&e.jsxs(S.Container,{align:"end",open:c,onOpenChange:o=>{g(o)},customTrigger:e.jsx(N,{variant:c?"secondary":"tertiary",size:"md",responsiveSize:{lg:"lg"},iconLeft:x.SORT_DESC}),children:[e.jsx(S.Item,{icon:r.order==="tvl"?x.CHECKMARK:void 0,selected:r.order==="tvl",onClick:()=>C("tvl"),children:t("explore.sortBy.largestTreasury")}),e.jsx(S.Item,{icon:r.order==="proposals"?x.CHECKMARK:void 0,iconPosition:"right",selected:r.order==="proposals",onClick:()=>C("proposals"),children:t("explore.sortBy.mostProposals")}),e.jsx(S.Item,{icon:r.order==="members"?x.CHECKMARK:void 0,iconPosition:"right",selected:r.order==="members",onClick:()=>C("members"),children:t("explore.sortBy.largestCommunity")}),e.jsx(S.Item,{icon:r.order==="createdAt"?x.CHECKMARK:void 0,iconPosition:"right",selected:r.order==="createdAt",onClick:()=>C("createdAt"),children:t("explore.sortBy.recentlyCreated")})]})]})]}),X?e.jsx(me,{objectIllustration:{object:"MAGNIFYING_GLASS"},heading:t("explore.emptyStateSearch.title"),description:t("explore.emptyStateSearch.description"),secondaryButton:{label:t("explore.emptyStateSearch.ctaLabel"),iconLeft:x.RELOAD,onClick:Z,className:"w-full"}}):e.jsxs(Qe,{children:[w?.map((o,ee)=>e.jsx(Ee,{dao:o},ee)),L&&e.jsx(ge,{size:"xl",variant:"primary"})]})]}),k>0&&F>0&&e.jsxs("div",{className:"flex items-center lg:gap-x-6",children:[V&&e.jsx(N,{className:"self-start",isLoading:R,iconRight:R?void 0:x.CHEVRON_DOWN,variant:"tertiary",size:"md",onClick:()=>Y(),children:t("explore.explorer.showMore")}),e.jsx("span",{className:"ml-auto font-semibold text-neutral-800 ft-text-base lg:ml-0",children:t("explore.pagination.label.amountOf DAOs",{amount:F,total:k})})]}),e.jsx(Oe,{isOpen:i,filters:r,daoListLoading:L,totalCount:k,onFilterChange:p,onClose:()=>{d(!1)}})]})},Ue=a.div.attrs({className:"flex flex-col space-y-4 xl:space-y-6"})``,ze=a.div.attrs({className:"flex flex-col space-y-3"})``,Qe=a.div.attrs({className:"grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-6"})``,Ve=a.p.attrs({className:"font-semibold ft-text-xl text-neutral-800"})``,Ye=a.div.attrs({className:"flex justify-between space-x-3"})``,Je=a.div.attrs({className:"flex space-x-3 items-start"})``,Xe=""+new URL("coloredLogo-bfc02651.svg",import.meta.url).href;function Ze(){const{t}=v();return e.jsx(et,{children:e.jsx(U,{children:e.jsxs(tt,{children:[e.jsxs(st,{children:[e.jsx(at,{children:t("explore.hero.title")}),e.jsx(lt,{children:t("explore.hero.subtitle1")})]}),e.jsx(rt,{children:e.jsx(ot,{src:Xe})}),e.jsx(nt,{children:e.jsxs(it,{children:[e.jsx(ct,{src:Se}),e.jsx(dt,{src:he})]})})]})})})}const et=a.div.attrs({className:"bg-primary-400 h-[448px] -mt-20 pt-20  xl:h-[536px] xl:pt-24 xl:-mt-24 overflow-hidden"})``,tt=a.div.attrs({className:"flex justify-center xl:justify-between col-span-full xl:col-start-2 xl:col-end-12 relative"})``,st=a.div.attrs({className:"xl:space-y-1.5 space-y-2 max-w-lg pt-9 xl:pt-20"})``,at=a.h1.attrs({className:"text-neutral-0 font-semibold ft-text-5xl xl:text-left text-center xl:leading-[60px] leading-[38px]"})`
  font-family: Syne;
  letter-spacing: -0.03em;
`,lt=a.h3.attrs({className:"text-neutral-0 ft-text-lg font-normal text-center xl:text-left leading-[24px] xl:leading-[30px]"})``,rt=a.div.attrs({className:"h-full"})``,ot=a.img.attrs({className:"w-[568px] hidden xl:block"})``,nt=a.div.attrs({className:"absolute top-64 xl:top-40 right-0 w-[568px]"})``,it=a.div.attrs({className:"relative w-full h-full"})``,ct=a.img.attrs({className:"h-80 absolute xl:-left-28 xl:-top-40 -top-[152px] left-28"})``,dt=a.img.attrs({className:"xl:h-80 h-60 absolute xl:-right-40 xl:top-10 -right-10 -top-12"})``,bt=()=>{const{network:t,setNetwork:s}=be();return b.useEffect(()=>{const n=Ne(t);ve.includes(n)||(console.warn("Unsupported network, defaulting to ethereum"),s("ethereum"))},[t,s]),e.jsxs(e.Fragment,{children:[e.jsx(Ze,{}),e.jsx(U,{children:e.jsxs(xt,{children:[e.jsx(je,{}),e.jsx(He,{})]})})]})},xt=a.div.attrs({className:"col-span-full xl:col-start-2 xl:col-end-12 space-y-10 xl:space-y-[72px] mb-10 xl:mb-20 pb-10"})``;export{bt as Explore};
