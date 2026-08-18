import '../src/styles.css';

export const metadata = {
  title: '深栈 · 面试练习台',
  description: '大模型与后端工程面试练习台'
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
