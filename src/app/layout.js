import "./globals.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import { Inter } from "next/font/google"
import MainHeader from "@/ui/MainHeader"
import Sidebar from "@/ui/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ABC | Dashboard",
  description: "Your AI friendly video/audio to text converter",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} grid grid-cols-12 relative`}>
        <Sidebar/>
        <main className="col-span-9">
          <MainHeader/>
          {children}
        </main>
      </body>
    </html>
  )
}
