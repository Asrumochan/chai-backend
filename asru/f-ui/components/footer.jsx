import { PageFooter } from '@uhg-abyss/web/ui/PageFooter';
import '../App.scss';
export const Footer = () => {
    const subFooterLinks = [
        { label: 'United HealthCare Services, Inc', href: '' }
        // { label: 'Terms Of Use', href: '#' },
        // { label: 'Contacts', href: '#' }
    ];
    return <PageFooter subFooterLinks={subFooterLinks} />;
};
