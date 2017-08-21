import Layout from '../components/layout'
import dynamic from 'next/dynamic';


const HelloBundle = dynamic({
  modules: (props) => {
    const components = {
      Hello1: import('../components/hello1'),
      Hello2: import('../components/hello2')
    }

    // Add remove components based on props

    return components
  },
  render: (props, { Hello1, Hello2 }) => (
    <Layout title='Passbook Server'>
      <div>
        <h1>{props.title}</h1>
        <Hello1 />
        <Hello2 />
      </div>
    </Layout>
  )
})

export default () => (
  <HelloBundle title="Dynamic Bundle"/>
)
