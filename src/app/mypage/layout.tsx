import { ReactNode } from 'react'

export default function MypageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {children}
      </div>
    </div>
  )
}
