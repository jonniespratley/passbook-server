import React from 'react'

export default class extends React.Component {
  static async getInitialProps({req}) {
    console.log(req);
    return req
      ? {
        userAgent: req.headers['user-agent']
      }
      : {
        userAgent: navigator.userAgent
      }
  }
  render() {

    const pass = this.props.pass;
    console.log('PassCard', this);
    return (

      <div className='pass'>
        <div className="pass pass--front pass--generic flex flex--col">

          <div className="pass__header">
            <div className="pass__logo u-mr-"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49212/logo@2x.png"/></div>
            <div className="pass__brand">{pass.logoText}</div>
          </div>

          <div className="pass__body">
            <div className="pass__title delta">Jonnie Spratley</div>
            <div className="pass__img"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49212/avatar.png"/></div>
          </div>

          <ul className="pass__fields">
            <li className="pass__field">
              <div className="label">Member Since</div>
              <div className="value">2013</div>
            </li>
            <li className="pass__field">
              <div className="label">Level</div>
              <div className="value">Senior Software Engineer
              </div>
            </li>
          </ul>

          <div className="pass__footer flex flex--bottom flex--justify u-mt">
            <div className="left">
              <i className="fa fa-upload"></i>
            </div>
            <div className="middle">
              <div className="qrcode"><img src="//placehold.it/125"/>
                <div className="qrcode-label">Staff ID 0000001</div>
              </div>
            </div>
            <div className="right">
              <i className="fa fa-info-circle"></i>
            </div>
          </div>
        </div>

        <div className="pass pass--back">
          <ul className="pass__fields">
            <li className="pass__field">
              <div className="label">Phone #</div>
              <div className="value">555-555-5555</div>
            </li>
            <li className="pass__field">
              <div className="label">Email</div>
              <div className="value">jonnie.spratley@email.com</div>
            </li>
            <li className="pass__field">
              <div className="label">Team</div>
              <div className="value">Calvus</div>
            </li>
          </ul>
        </div>

        <style jsx>{`
             .pass {
              margin: 0 auto;
              width: 325px;
              min-height: 400px;
              border-radius: 10px;
              padding: 0.5rem;
              color: white;
              background-image: -webkit-linear-gradient(#999, gray);
              background-image: linear-gradient(#999, gray);
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-orient: vertical;
              -webkit-box-direction: normal;
              -ms-flex-direction: column;
              flex-direction: column;
            }
            .pass__header {
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: center;
              -ms-flex-align: center;
              align-items: center;
              margin-bottom: 1rem;
            }
            .pass__header .pass__brand {
              font-size: 1.5rem;
              font-weight: bold;
            }
            .pass__header .pass__logo {
              margin-right: 0.5rem;
            }
            .pass__header .pass__logo img {
              width: 29px;
              height: 29px;
            }
            .pass__fields {
              font-size: 0.9rem;
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              font-size: 0.9rem;
              white-space: nowrap;
              list-style-type: none;
              margin: 0;
              padding: 0;
            }
            .pass__body {
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              font-size: 0.9rem;
              -ms-flex-line-pack: bottom;
              align-content: bottom;
              -webkit-box-pack: justify;
              -ms-flex-pack: justify;
              justify-content: space-between;
              -webkit-box-align: end;
              -ms-flex-align: end;
              align-items: flex-end;
              margin-bottom: 2.5rem;
            }
            .pass__img {
              padding: 0.3rem;
              background: #fff;
            }
            .pass__img > img {
              height: 80px;
              width: 80px;
            }
            .pass__field {
              margin: 0;
              padding: 0;
              -webkit-box-flex: 1;
              -ms-flex: 1;
              flex: 1;
            }
            .pass__field .label {
              font-weight: bold;
            }
            .pass .qrcode {
              padding: 0.7rem;
              background: #fff;
              border-radius: 5px;
            }
            .pass .qrcode-label {
              font-size: 0.8rem;
              color: #000;
              text-align: center;
            }
            .pass--back .pass__fields {
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-orient: vertical;
              -webkit-box-direction: normal;
              -ms-flex-direction: column;
              flex-direction: column;
              list-style-type: none;
              background: #fff;
              margin: 0;
              padding: 0.5rem;
            }
            .pass--back .pass__field {
              margin-left: 1rem;
              border-bottom: 1px solid #ccc;
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-orient: vertical;
              -webkit-box-direction: normal;
              -ms-flex-direction: column;
              flex-direction: column;
              color: #666;
              -webkit-box-flex: 1;
              -ms-flex: 1;
              flex: 1;
              margin-bottom: 0.5rem;
            }
            .pass--back .pass__field .label {
              font-weight: bold;
              ,margin-bottom: 0.5rem;
            }
             `}</style>
      </div>
    )
  }
}
