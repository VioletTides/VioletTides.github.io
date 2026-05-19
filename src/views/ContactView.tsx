import React, { useState } from 'react';
import { Zap } from 'lucide-react';

import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.3 }
  }
};

export const ContactView = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams({
      subject: subject || 'Website inquiry',
      body: body || 'Hi Robin,\n\n',
    });

    window.location.href = `mailto:robin34anderson@gmail.com?${params.toString()}`;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col gap-6 min-h-0"
    >
      <div className="bg-amber-primary/10 border border-amber-primary/30 p-4 amber-text-glow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-amber-primary tracking-tight uppercase">COMM_TERMINAL::ESTABLISH</h2>
          <p className="text-[11px] text-amber-primary/60 mt-1 uppercase tracking-widest">Secure handshake required for outbound transmission.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 bg-black/40 px-3 py-2 border border-vfd-green/20">
          <div className="w-2 h-2 bg-vfd-green rounded-full animate-pulse shadow-[0_0_8px_#00ff41]" />
          <span className="text-[11px] font-bold text-vfd-green green-text-glow tracking-tighter">SECURE_LINK</span>
        </div>
      </div>

      <div className="flex-1 bg-black/40 border border-white/10 p-4 sm:p-8 flex flex-col gap-8 relative md:overflow-y-auto">
        <div className="absolute inset-0 crt-bg-effect opacity-10 pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <label htmlFor="contact-subject" className="text-[11px] text-amber-primary/50 uppercase tracking-widest block">Input_Subject</label>
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 group focus-within:border-amber-primary/50 transition-colors">
              <span className="text-amber-primary animate-flicker">&gt;</span>
              <input 
                id="contact-subject"
                type="text" 
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Transmission header..." 
                className="bg-transparent border-none text-sm w-full placeholder:text-white/20 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-body" className="text-[11px] text-amber-primary/50 uppercase tracking-widest block">Input_Body</label>
            <textarea 
              id="contact-body"
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Encryption sequence... Input text data now." 
              className="bg-white/5 border border-white/10 p-4 text-sm text-amber-primary w-full placeholder:text-white/20 font-mono focus:border-amber-primary/30 transition-colors resize-none"
            />
          </div>

          <button type="submit" className="bg-amber-primary text-black font-bold text-sm px-8 py-3 uppercase hover:brightness-110 transition-all border border-amber-primary flex items-center justify-center gap-2 amber-box-glow w-full sm:w-auto">
            <Zap size={14} />
            SEND_TRANSMISSION
          </button>
        </form>

        <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-white/5 p-4 space-y-1">
            <span className="text-[11px] text-white/30 uppercase tracking-widest block">Direct_Access</span>
            <a
              href="mailto:robin34anderson+websitecontact@gmail.com"
              className="text-sm text-amber-primary/80 amber-text-glow font-mono break-all hover:text-amber-primary"
            >
              robin34anderson@gmail.com
            </a>
          </div>
          <div className="border border-white/5 p-4 space-y-1">
            <span className="text-[11px] text-white/30 uppercase tracking-widest block">Location_Ref</span>
            <p className="text-sm text-amber-primary/80 amber-text-glow font-mono">Toronto, ON</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
