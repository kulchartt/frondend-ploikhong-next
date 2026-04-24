// ===== Mount + portals for product detail & listing flow =====
function ProductPortal() {
  const [open, setOpen] = useState(null);
  useEffect(()=>{ window.__openProduct = p => setOpen(p); },[]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : ''; },[open]);
  if(!open) return null;
  return <V4Detail product={open} onClose={()=>setOpen(null)}/>;
}

function ListingPortal() {
  const [open, setOpen] = useState(false);
  useEffect(()=>{ window.__openListing = () => setOpen(true); },[]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : document.body.style.overflow; },[open]);
  if(!open) return null;
  return <V5Listing onClose={()=>setOpen(false)}/>;
}

function AuthPortal() {
  const [open, setOpen] = useState(false);
  useEffect(()=>{ window.__openAuth = () => setOpen(true); },[]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : document.body.style.overflow; },[open]);
  if(!open) return null;
  return <V7Auth onClose={()=>setOpen(false)}/>;
}

function HubPortal() {
  const [state, setState] = useState(null);
  useEffect(()=>{ window.__openHub = (mode='sell') => setState({mode}); },[]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setState(null); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{ document.body.style.overflow = state ? 'hidden' : document.body.style.overflow; },[state]);
  if(!state) return null;
  return <V8Hub initialMode={state.mode} onClose={()=>setState(null)}/>;
}

function ChatPortal() {
  const [state, setState] = useState(null);
  useEffect(()=>{ window.__openChat = (threadId=null) => setState({threadId}); },[]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setState(null); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{ document.body.style.overflow = state ? 'hidden' : document.body.style.overflow; },[state]);
  if(!state) return null;
  return <V9Chat initialThreadId={state.threadId} onClose={()=>setState(null)}/>;
}

function StubPortal({ name, Component }) {
  const [open, setOpen] = useState(false);
  useEffect(()=>{ window['__open'+name] = () => setOpen(true); },[name]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : document.body.style.overflow; },[open]);
  if(!open) return null;
  return <Component onClose={()=>setOpen(false)}/>;
}

ReactDOM.createRoot(document.getElementById('v2')).render(<V2/>);

const pdpPortal = document.createElement('div');
pdpPortal.id = 'pdp-portal';
document.body.appendChild(pdpPortal);
ReactDOM.createRoot(pdpPortal).render(<ProductPortal/>);

const lstPortal = document.createElement('div');
lstPortal.id = 'lst-portal';
document.body.appendChild(lstPortal);
ReactDOM.createRoot(lstPortal).render(<ListingPortal/>);

const authPortal = document.createElement('div');
authPortal.id = 'auth-portal';
document.body.appendChild(authPortal);
ReactDOM.createRoot(authPortal).render(<AuthPortal/>);

const hubPortal = document.createElement('div');
hubPortal.id = 'hub-portal';
document.body.appendChild(hubPortal);
ReactDOM.createRoot(hubPortal).render(<HubPortal/>);

const chatPortal = document.createElement('div');
chatPortal.id = 'chat-portal';
document.body.appendChild(chatPortal);
ReactDOM.createRoot(chatPortal).render(<ChatPortal/>);

function LazyStubPortal({ name }) {
  const [open, setOpen] = useState(false);
  useEffect(()=>{ window['__open'+name] = () => setOpen(true); },[name]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : document.body.style.overflow; },[open]);
  if(!open) return null;
  const Component = window['V11'+name] || window['V10'+name];
  if(!Component) return null;
  return <Component onClose={()=>setOpen(false)}/>;
}

['Complaints','Coins','Admin'].forEach(name => {
  const div = document.createElement('div');
  div.id = name.toLowerCase()+'-portal';
  document.body.appendChild(div);
  ReactDOM.createRoot(div).render(<LazyStubPortal name={name}/>);
});
