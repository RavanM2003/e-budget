import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QuickActionCard = ({ title, description, icon: Icon, onClick, to }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} onClick={handleClick} className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm transition hover:border-brand-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-brand-500" />}
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};

export default QuickActionCard;
