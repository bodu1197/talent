import { ReactNode } from 'react'

export default function MypageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-gray-50 flex overflow-hidden">
      {children}
    </div>
  )
}
