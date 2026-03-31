export default function MapSection() {
  return (
    <div className="w-full md:w-1/2 h-[500px] md:h-auto relative overflow-hidden bg-stone-100 group">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d690268.0038701453!2d-118.45805444461628!3d33.72397563569635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2d44d8a00dfe5%3A0xb04af00256d96309!2sE%26R%20Salon%203180!5e0!3m2!1sen!2s!4v1774728957541!5m2!1sen!2s"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      />
    </div>
  );
}
