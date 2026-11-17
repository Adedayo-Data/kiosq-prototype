function Hero() {
  return (
    <section className="Hero-main-container">
      {/* I'm staring with the top pill I can see in the hero section. I first started using another section tag 
            but now thinking about it I fill instead of using a section tag for the pills at the top we can just use a div afterall
            they do the same thing. So I would never delete anything I would just comment them out so you can see my mistakes and 
            thought processes */}
      {/* <section className="top-pill">

            </section> */}
      {/**using a div for the pill instead */}
      <div className="top-pill">
        <p>Meet Ara • AI Sales Agent</p>
        <p>Live System</p>
      </div>

      {/**Working on the logo section with the chat bubble or icon thing. The logo is an image so I would just use img tag.
       * The image has not yet been added to the public folder so we'll just assume for now
       */}
      <div className="logo-section">
        <div className="logo">
          <img src="/public/logo.png" alt="Kiosq" />
        </div>
        <div className="messageIcon">
          <img src="/public/messageIcon.svg" alt="Message icon" />
        </div>
      </div>

      {/* the main copy or Hero text */}
      <div className="Hero-text-main">
        <h1>
          Your <span className="highlight">shop</span>
          <br /> in the chat.
        </h1>

        <p>
          Sell on WhatsApp with safe payments and Ara, your AI sales agent that negotiates for you.
        </p>
      </div>

      {/* CTA */}
      {/* I don't think I'm getting this well at all....*/}
      <div className="cta">
        <a href="#">Open your Kiosq </a>
        <p>takes less than 60 seconds</p>
      </div>

      {/* Chat bubble */}
      <div>
        <div className="profile-picture">
          <p>Ara</p>
          <p>Ara • Kiosq AI Agent Active in dm_uche_lagos</p>
        </div>
        <div>
          <p>
            Buyer offered ₦22,000 for Vintage Adire Shirt. Floor is ₦25,000.
            Counter-offered ₦26,500 with free delivery within Yaba!
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;

{
  /**
  I know you would be so annoyed with me because This is so so wrong...I got a lot wrong...but honestly this is what I can do with no assistance.
  I know I have a very long way to go but then....I have you to tag along always. I'll rate myself a 2/10. Please rate me less if you must. It's for my growth. Thanks
  */
}
