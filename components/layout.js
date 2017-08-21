import Link from 'next/link'
import Head from 'next/head'
const nav = ['About', 'Browse', 'Status'];
export default ({ children, title = 'This is the default title' }, nav = []) => (
  <div>
    <Head>
      <title>{ title }</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      <link rel="stylesheet" href="/static/styles/bootstrap4.min.css"/>
    </Head>
    <header>
      <nav className="navbar navbar-dark bg-dark">
        <Link href='/'><a className="navbar-brand">passbook-server</a></Link>
        <ul className="navbar-nav">
          {
            ['About', 'Browse'].map((item) => {
              <li className="nav-item"><Link href='/'><a>{item}</a></Link></li>
            })
          }
        </ul>
      </nav>
    </header>

    <div className="container-fluid">
      { children }
    </div>

    <footer className="p-2">
      {'passbook-server v1.0.0'}
    </footer>


  </div>
)
