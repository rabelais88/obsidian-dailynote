(()=>{let e=(e,r)=>"eur"===e.slice(-3)?Number(e.slice(0,-3))*(r??1350):"brl"===e.slice(-3)?Number(e.slice(0,-3))*(r??250):Number(e),r=e=>Math.round(e).toLocaleString(),t=[],a=[],n=[],l=Array.from(dv.current().file.lists.map(e=>e.children)).flat();l.forEach(e=>{if(e.spent){let[r,a]=e.spent.split("-");t.push({name:r,price:a});return}if(e.spentAlt){let[r,t]=e.spentAlt.split("-");a.push({name:r,price:t});return}if(e.earned){let[r,t]=e.earned.split("-");n.push({name:r,price:t})}});let p=t.reduce((r,t)=>r+e(t.price,dv.current().koreanWonRate),0),s=a.reduce((r,t)=>r+e(t.price,dv.current().koreanWonRate),0),i=n.reduce((r,t)=>r+e(t.price,dv.current().koreanWonRate),0);dv.paragraph(`total expenses: ${r(p)}`),s>0&&dv.paragraph(`total alternative expenses: ${r(s)}`),i>0&&dv.paragraph(`total earnings: ${r(i)}`);let c=i-p,o=dv.paragraph(`💰Today's Total: ${r(c)} KRW`);o.style.color=c>0?"green":"red"})();
//# sourceMappingURL=view.js.map
