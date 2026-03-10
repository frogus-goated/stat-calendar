"use client";
import{createContext,useContext,useState,useEffect,ReactNode}from"react";
type Theme="dark"|"light";
const Ctx=createContext<{theme:Theme;toggle:()=>void}>({theme:"dark",toggle:()=>{}});
export const useTheme=()=>useContext(Ctx);
export default function ThemeProvider({children}:{children:ReactNode}){
  const[theme,setTheme]=useState<Theme>("dark");
  const[m,setM]=useState(false);
  useEffect(()=>{const s=localStorage.getItem("sc-theme")as Theme;if(s==="light"||s==="dark")setTheme(s);setM(true);},[]);
  useEffect(()=>{if(!m)return;document.documentElement.classList.toggle("light",theme==="light");document.documentElement.classList.toggle("dark",theme==="dark");localStorage.setItem("sc-theme",theme);},[theme,m]);
  return<Ctx.Provider value={{theme,toggle:()=>setTheme(t=>t==="dark"?"light":"dark")}}>{children}</Ctx.Provider>;
}