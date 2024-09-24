import React from 'react'
import Footer from './Footer'
import TSWIcon from './TSWIcon'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LayoutProps {
  title: string;
  footerPosition?: string;
  children: React.ReactNode;
  headerRightElement?: React.ReactNode;


}

export default function Layout({ title, children, headerRightElement, footerPosition }: LayoutProps) {
  const navigate = useNavigate()
  return (

    <div className="w-[350px] min-h-[296px] max-h-[600px]">
      <div className="flex items-center justify-between px-5 py-2 border">
        <TSWIcon>
          <ChevronLeft size={20} onClick={() => navigate("/")} />
        </TSWIcon>
        <div className="flex-grow text-center">
          <p className="font-bold text-sm">{title}</p>
        </div>
        {headerRightElement ? (
          headerRightElement
        ) : (
          <div className="w-10"></div>
        )}
      </div>
      <div className='px-5'> {children}</div>

      <Footer position={footerPosition} />
    </div>


  )
}