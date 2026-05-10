// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import { useUser } from '@/components/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, DollarSign, Eye, Loader2, Shield, Zap, Award, 
  TrendingUp, CheckCircle, Star, Lock 
} from 'lucide-react';

// Mock properties for demo
const MOCK_PROPERTIES = [
  { id: 'prop_1', title: 'Modern 3BR in Bole', location: 'Bole', price: 15000, image: '/images/house-1.jpg', verified: true, score: 92 },
  { id: 'prop_2', title: 'Luxury Villa in Summit', location: 'Summit', price: 25000, image: '/images/house-2.jpg', verified: true, score: 88 },
  { id: 'prop_3', title: 'Spacious Apartment in Yeka', location: 'Yeka', price: 12000, image: '/images/house-3.jpg', verified: true, score: 95 },
];

export default function TenantDashboard() {
  const router = useRouter();
  const { role, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!role) {
      router.replace('/?role-required=true');
      return;
    }
    if (role === 'landlord' || role === 'broker') {
      router.replace('/submit');
    }
  }, [role, loading, router]);

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mx-auto mb-4" />
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (role !== 'tenant') return null;

  const scrollToProperties = () => {
    const propertiesSection = document.getElementById('properties-section');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      
      {/* Background Image Container */}
      <div className="fixed inset-0 -z-10">
        {/* Background image from free online source - modern apartment building */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXFRUVGBgXFxYYGxUXFxUXFxUWFxoYICggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lICUtLS0tLS8vLy0tLS0tLS0tLS0tLS0vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAECBAUGB//EAEIQAAEDAgIHBAgDBwMEAwAAAAEAAhEDIQQxBRJBUWFxgSKRobEGExQyQsHR8FJi4RUzcoKSsvEjosIHQ7PSU2Oj/8QAGgEAAwEBAQEAAAAAAAAAAAAAAgMEAQAFBv/EADERAAICAQQBAQYFBAMBAAAAAAABAgMRBBIhMUFRBRMiMmGBcZGhsfBSwdHhFDNCI//aAAwDAQACEQMRAD8AOJS1+qIXbrpjUG0K5xfoUwuTXY0ApnUUiRyUhVS8yXQ9RhP5gRlQJVsXUH0JXK9eTJaJ9xBNdZEagta5p4JF8HJFvTAVUol1jd6Y0pVY1dycV0lrymUqXhoMeKgyFCpjchHena5pvkszhchYy/hCeqBBQKlNoKn7QG8Qma9pvCFNrnwHJRax5DNAUwLG10qdMBsz97FFjw7JCnkJrHYGvyVWoxabcOHDiq9XClUV2R6I7qpvlGW0lpV+liJF8wg1aOzahNBGYT3FS5JYWTg8eAteqquvJRfVF2amMKdiZFpE1qlJ5wCIRKNKVYoDVEQpayLd6C/dpcsiABmpB8qJaSo1Ah4YxNrwSNTcmBQU4aTmtwkCpSZJxGxJIMhDr1GtBLnBo3kwPFdlHbX5HcFH1axMb6TU22pgvO8y1v1Pgufx2k6tX33mPwize4Z9ZXbvQVJxR0+N07Rp2B9Y7c3Lq7LulYGN07WqWB1G7mW73ZnwWbCQXNtinL0EGpwE4CcLgBAJJ08LTD08VGTGsJ3KfZORBXIsxZLrJvbCHk7UGxnoe9j6HXepTPw7d5Cx6GkJF3RChW0nfslLcJMojdCPg3WUSLggpy7hCw6ekycx1Eo2G0g4GJkKeenk+S2vWw4WDaJCE9kojdaAVNhduUjrlEuV8JEWYVpGaXsAurrH72ozC07FPL3q9R6lW/QznYEJjSIjs7FqikDlKQp338wlb5+Q8x8GBXwhkk5WQabY2d910OJw1stipNoD4lbVbmPJHbD4vhMqi9w2Si06kbFoCiAfuEquFBFhdUbkTpSx30QpVR0PgURogT3/AKKqezmFXOKAOSx1Z6CV6XzFvFajufz2rOruIs26jVqa2RUqOX6qiuG1csivt3ywl9wLHvmYVqm503VqhREZqTqQHwyteoinhHR0c2stg2Tu8FFzAp6wGdvFDfUG9D7zLGOlJES7chObO1JzycgsrHaeo07a2u7cyD3nIeaYm/BNNRXzGoAAq2P0jTp++8N4Zk8gLrlMb6SVn2b/AKY/Ld3Vx+ULGcSTJMk5naUaT8kk74riJ0WN9KSbUWx+Z9z0aLDrKwsTiX1DrPcXHeTlyGQ6IbU8IsE0puXYwCkAnhJEAMQknJAzsgnEj4QXcsu9BKyMe2HGuUukHCRVVz3nc3xP0Q/UT7xLuZSJaqK6HR0kn2HfjGDbJ3C6Gca7Yw9SnawDIQmhIlqpvooWlguzcqOIKGaxm62a2i3nYqr9DVPwlehvQh1MpevKIzEKTtHOGxRGEduW70d7tl/C4kTdXpm4KyqOEduW1o/BixJS5SQ6EGzV0VpM2aQCNu9dNhsOHDWBtzWBR0KNYOY47yIIPRdho2lLAJMDYQZSHJDmmkVvUNFnCVNtCnsgLRGFp7Z6ID8I34SAeMfNBuid8feQPsW5ycYYjiiB2rme4IjcTSOb4PFIsjB+CqqyxeQDsPOxAq4AFazKQPuuDuRBVfEBzVFJJP4WWxsz2YFfRbtkqnWpVW5FdAcQNpQK1Zp2hFG6afIeyLOeq1n/ABDwWfiMSPwrexbzsgLIraOe/IjvVdU4vmTwIujNL4U2Zj8QNgCVPEmbAq9+xCLuKNTpU27fBV7lj4eSBKSl8fwgKNZ3EffJHk7/ABCraQ0xRpe84A7ABLu4eZXO6Q9MKjrUmhg/EQCegyHWUjZZJ8IqeqorXMs/gdNXqNYNZ5DW73GB3mywMf6UU22pNLzvNm/U+HNcvicQ+odZ7i529xmOW7kEKFRCnHbPNv17lxBYX6lzH6WrVbPfb8Ley3qBn1lUgFKEinpJEEpSk8sYBKEP2huztchPjko+tccgBzue4W8UuV0I9sONM5dIsAJn1GjMgIYpE+84nw8ro1Kk0ZAdFNPWpfKimGib+Zg/WE+608zYeKRY45uA5fU/RWRTRW0lLPVTl5K4aSEfBQGFG6eJv+iL6pXdVMaaR7weqsFL1abVVpzEJzFu8FwAkJoUnFQLhvCLIOD1mrixtpqHr27WOCFjNWk4NfUIJE7wBvKbB1jUcWsfMbTYHlKs3fDuXX3G7Fu2t8+nAXVpO2kHkpDAMORHVpRjham5n9SY4Z34eofCS7vRlKoXlFStofW917eUhFw2gSLzfmjCg7axx5GVP1YGbCOoQu+XSl/PzNWmhnO39y7hy9gALNaOJCst0iRnSf0MqhSrgWDnffMq23GAfF3hvyKnnqLF4yH/AMavsvUtN0/iY/mQfkjjSeHOcjv+azvaz8NRnItHmtLDvB94Uzvsfkp7NVJcuP6mOpLoGXYd3u1IPOPNBr6PcfdqT3HyK1vZKLs6Te8/RPS0TRmzI5P+qUtZnxJCd8V2c2MNiaZkAHoR5K3R0+8WfTnmJW77AGZMd4/IqGJMC7T1B+a2VldvzL+wasi+MFWnXoVbOZqnhZUNI6Ibm01AN41XI9c0jkADxELI0jptuHu6qGDYJknk25PQKaOnt3//ACk/wGpqK3ZwvqV8Rgn7K3RzSPlCzquHrAE6zSBmQRA57lS0n/1Ec4FtKk0nLXqCOoa0iepHJcbpDH1a5mq8u4WDRyaLL2tJptU/+zCX5/tgiv8AaFKWFlv6Pj+fY6fF+lDKdg4vduYZb1cbd0rndIekFaruYPyCD1dn3Qs5zYzsOKA/FMG2eX1yXqxrrhyeRZqbruPASEtVVX407ABzv4ITqrjm49LeSyV8V0Ljp5vsuve0ZkD73IRxG5pPO36+CrNtlCmHJEtTLwUQ0sfIUucdoHL6lR9SNt+ZnzyTB6l7Q0ZwppWSl2ymNcI9IIGIjWKqcfTG3uTDSrBscen6pT3eg1OC8mk2miNaqNPSLz+7ouPO3kPmig4p2QY0cfspTUvPA1Sj4Tf2NCmzPK8cct05dFJzQMyqLdF1ne/XtwkeSsH0YYA0veTrCRcXEkbLi4OaU3FdyGpTfUfzGqY6k3N7el/JVqumqYyBPSPMrQZoagPhnmSVcwuHoNIlg1ZuGwDHAkGD3od9a9WF7u1+iOcdpKo73aXfP0+apNqV6jnNEAtN9kX6rr3ubsy5rA0TS1q9eI97b/E5PqnuT2xJ763HG6XZUboeo73qndJ84Rh6PN2ud4LoG4beR3KYoj8X+39Ue3UPpCcUrtnSaR0aakHWMjgq9DBvp39YGrfGIH5v6v0VTGV7HIGLG5P6qyF038OOCmzTVL488kaNYBkufrDgST3BGpVqZFn+MHxWLTY4knXE8Wx5FHpYh7SC6DHA/JHOnPTFVajGMrj+fU0jiaUTrvHUDzCnQr0jk+oeRaUE6QYR2mMP9SenUpn3AwHkf/YKOUGlymXRlufwyX8+5oMr0Npd1aPkrNLE4TbP9KytWpNnNb/K35uJQcY2s/stqAA5zqT0IUrqjJ/Nj7/6HyVmOE/59zqKVTR/43D+Q/RbGG0jhALVT8x3hcdUxNNjL0yCAAXgPdeLuEmPkqOj9LxUB9YHNgnVqUmQdsSDMqV6V2JySlx6vv8ALIiyGHiUn+GUel0dLMPuVNZomZAJ4Z5DomxOncOGGo7U1Rtse6MyvOcX6V+sIDqDDHuiHgctXWhUqNf19TUrxRZn2WBrWxcWG/LqmV6S6KzZwlz68fREmytvjJ1Nf/qLROqG0LT2pcRt2QrZ9L8IWB2tVpk/CHF3gbLIw37PFoa+NuqR3kmD3ImI9kfemwnjMju2IZ3VSaj7qaXrwhtWmbff8/Myv+oWn6rDSZQeWNe1xc4BocYIAg/DmcoXm9auJLnOlxzMlxPM5969G0hobDVI9YCYmAZtNzEHgqTvRjCH4HdPWfJyv0uqrorUYrn1wDf7Nstk3nj0PPn4z8LT1t5KvUxFQ7Y5D6r0J/ovhfwv/wD0+qEfRjDbNf8A3fNUPWuQpeyWvQ87cwnjxMnzSFI7l6C70XobDU7x82oR9GqP4qn+3/1Qe9b6Gf8AAkjg6rS0SRZVva9zV2XpBoVlOg9we4xq2IbtcBsAXIGmmwi5LLIr06pbSDsUfwhSbVeR8I6So1aXZJg5fJTomw5DyQ2LaZVJyfIzqLjm89BCdujnT7jzzBWjooxWpn83yK367pqH+Fvm5FTFSXLBv+Ho5mjot/8A8I6lvzVbEYUsiQPiy/iC7EUJyXM6X2c3/wBzU6VcFFtCVKzcky1+0BEat5mbzeLZxHTaps0izaY5h3ylVBSVSnLnObq5EjOJuR15BeWq4yPVlbKJsVNL0m/GOjX/ADCGdOM2T/T9VHFaNa1kyJBib3kSNsbeCoeonPwXKutmO6w0P2+BPZNxFw3w3FDoaaLiQGtuLFzja4vYdOqycYyAn0XR1iZ2BOhRW/AmzUWLydFR9a8SH0wJjJx3byN6qaIeW1a97zc5SQ514uuk0Ro6nqO7JPbO0/hbxWZoOg04rEgtBAdaRMdt+9ejVRXDGEefbdbNPP2GqYk7yheuO/xXTjDsGTW/0hOWj7AVi2kbVhP2tn4/NROKZ+PzWKWqJbzS9qLt7N32ln4vBP7Wz8XgsIBOELihkZM2/a6e/wAEva6e/wAFjSiNhA4obGTNlukh+LwKkdJjf4LJbCK3kkSrj6FUbrPUvPxgdmSeiZlZu7vCA0cERvLzQPCWEMUm3lsM2sM9Uf0tUvavyj+kLNp6UbMER3xnGxWBiZyA70El6oKNy8MM6q0/AByA8km1oyBHKyp4nGFokNHj8lXGlt7B0lck2ugXdBPl8mx7Y7eUxxh4qka53DxUHYjgPvqsUV6IY7n/AFMv+28/BI47ms01juCQcdybGEfQVK+X9TNH9oc/BIY4cfD6rIxdfUaXOsOl+SfC4trz2XA74iyaoQEvUTzjJP0kxIOHfnmz+9q4vVvfwXW6e/cPvtZ/e1ckSiwl0RahtyywdYdl3IqeHp2aeA8lCqOy7+E+WxaOjcM97W6rSey3IflBUeqeEhukWWx8IyHs/i+RWkXy88m/NBxGHfTLNdpbJESnpXeY3D5rtLP4QtVDEsG3o2lPj5Lj9Le9/NU/vC7PRRggfeS43St3fzVf/IESn8wMorESzRYS7O0ZcZzQtFtiu+8GXEWacnH8VvEc1ZpmDOz5rOqNl7/4j/cVDB9lti4Rq4lrqruyQZOVhaIF5NrHbuU30gxpmA7Vk8LDYeexV9FMLhqw6NaNYZSL2y37/mr+lMHZzi4MIItNoOyIgGNuxC+HtBXWTl9IRsymyJoXN/8AClj6LQ0Q8G/C19sJaJsXXbdozNrngramlgltTZ2WBqjVdn73/FvFZWhnxicSfzf8nK5gsUxtNxe6+uRDQXCYAEkwQOhKztFVgMRiDmCbf1OXoxurbS9Dzp1WJN/kdAaw3H76qBqjj99VXdpCmN/cg1NJM2E9xT3fUvJP7i5+BY2pqxBABvrZ5bh9VX0diNaQSC6TnbpleIKxBpBxEOOWUgHaLeC1dDuBcS5x7IkCRG7WEcOnPZKrN0i4044BKEqVdrpINhbI89yDhscx7i1smNuzznwTW0EpBwD9hEZP3P0UZG3ycVJrdw/2lC0OUgrPuyID15fqoNj7hVMXpamwDta0iRq6uW8HWhJkNU8dmk3kfJTY05wfP5rmm+kDnGG0zDrCYF77TY8lc0Zp9rg71sN1RJA2jK0/d0ptBxti2Rw+FdU7TIcDBHavcq7U0NWhxHZIaTa5zHGQsouFF80nBzTDgDnEmJnLKx3Lo8PpT1tN8TIpum+RltiNh5WQ2ua5XQFKrllS7MrD6Prk6r3WLSRrDcW5X4oOK0VimkltMOaNoBPe2xP8sqy1lVzgGkzqn4o2tWroulUaSahmRGcpc5yjzlfgPq06seMP8TlnVqzj+9aIzAZBB3XNjwKk1tUT/quNtsW5Ls6+AZWA1mScgcnDk4XHQrMxfotUF6Tp/K+3QOaLdWk8V0NZSniXDNu9nahcwe5fqc3VdiDb1lueznFlWbg3D8M7ySVo4ynUpfvWFnEgap5OBLe8zwQtcKxbJrKeTzZboPElh/Uq+xB37y/CTHhELd0bj2Uqfqm0mxxcZG2xIJHRZetxSLVkqYyCjc4sPpyo80nuBaGS2WzrH3hF+fBc2XrXqNVZ9AHYtUWgJve8ooVD2Xcirmj9IBgbfLUdA3tAseF/BM7CtiOEKbKZAABBAsNZlN3LZPikXw3jqJ7Hk1cbpr2k05Y5xadgO3kTuT1NVhNhJ1bMLnR734g1ZntlRvuto2INqeqbd6hU0nUJl1MGwHZO6fqk00bOOkNvv3c9s3KVMvILXuFsgdU8p2Fc/VpP1jMkS8C83DxreYVnD6aa09oVGcQEB2NY4CHnOqbiPfe0jvg9yY8pMSmm0d3U0RWLCaVBwqCprCQ6HNJk5nVG7IZLX0Vo+tTMOof6Z2EsBZIuGknLhZPhqogA4x8DYNUd9irbPZz7zqjxxe/5FfO2WPGP8n0Ma/JhY/0VxFXW9W2mATI7bJzm8dVTx/ojjXNHrHUgBf3m3yiQBeIXaUTg9lJ7v5nn/kmxNGkR2MFrfxNn+4FAtXNeP0/2A6U3yjyj2UNc9jtQljgP3dIg2BtLb7R0UMPXZrFvqqUwc6NMSZtBEE24LttJ+1m3sjQ0EQIdkHNJFrXDYyyJWDWqYhrNR2GbEkkxBOs7WPvDl0V8Lty5/cTKvD4/Yy6rmWHq6Q5NqsBNokU335ws3RuMFOrVJphwOwOqANucjOtH8S2GVT6wP9mNpMB7SJ1mkR2LRqkdVT0RiNSvWmkXSWS21gHgkGRtAI6qymWM/wCSPUR6xxz6F6ppGiQS6kQANjnnvkcR3qv6ym64omD/APY36LZwuLolwJwzgNp9WDMMiMsiTPRalLGYeMnZmAQ4QJsAJ3Ql2Wc8L+50IPyzzqjiciQDBIBygQRFrbclFtQjWiSLA8ieF+GarUKeV+YjPerBpGYvf4RtB8/NXpnmLHRabpKoW6jT2RIAjZlHHNX9H4ZxMuaQBkWze9xxFtqbRVQNOqGyCGlpN7ns6uUCNUyPPNbGpUPxAcjHyVNcM8tnDtafwHySFM7WxHEBRbhjtJPUfK6IzCDMgffl3JrYyKZNo4/7o+RWJpjRRPapmb+4JNybnj4rbe1jLuLAL53WZX9IGiRSEm4DiAG8xtKTPAyWMcmLWwzyPcYwZXhpsDAOsczfYg65ZLRqkeF92374KzidKViA17ouSCAAbmSJ3XVCqWtiLmbyc7mZSGJcl4INrPBtM5xvgEDmtbDYhw7Q7Logj5Ebisp1dwOdtsZZ5I+GbDHVdt4GzO/O6Ot448AfU7f0ZxdN7zrTrasavUXado+9q6XE46jSjX7M3Eg5dF5fRqzDmmCL2zBXQ4LS4qgMq3cMrm/Fu53D5SBLqdEpS35ePoevo/aLjD3fCl4b6Ojqek9BuUnk0j+6FVr+lQ2U3dYH1WFiMOAbGWnI5dDuPge8CuARxH33I6/Zum7xkG32pqk8cL7GtW9I3O/7Yji6fksPEU2uMtYKZz7EgHm09nwVhrQcrH770nUlZXp66/lRBdqrbfneSuWdVGBskIhBHBMTvCaIB9xTQEQsUCEOTcDagUHUgpaqSxmoEWJtTh4I0pIHENSBBjUvZmHNrTzARNVIMS5RYxSROnTaMtZv8LnDwBhXaGLqt92s/rqu8xKrUcKTlHh8lZZgt58Ep6Zy8Do6hR8mthvSbFs+Om4cWub5ErUw/pxiB71IH+F/1hc2KIG9OGcVNP2ZF/8AlD4671Z2dL0+Hx03t5tnylWKfplhn2Lmg7iBPcuHaSPuFMuB95oPOD5qSfsuK8MfDVr6HZYnGYepeWH+VcNovU9uxV4EiIttRBhqRuGgcWkj+1ZeO9Htdxc2o4Eme1fxzT9PoZQyueUK1OqUksY4Z3FEtGVQjqCrQxDh/wB1eZnQ+KZ7lWf5iPC6aceLQ48tUrZezs+f0FLWteDEawtJG7MSOi0cPW13Bpa3LVBgS2R8N4DjvzkhUqzYImd3kj4DFmlcE8ZAI5EHP9FauGec3g3dH0mVCWuvcPbENgB0jtZz7vf1WxWqhoJdEC5vreAXPVPSCq8Q1zWjgL8rzCoGu460mdYyRvP2U9WxS4B34OsbWYW6wcIuc48Fn4vSoaWlglsnW1g5pGUETA8NiwW4pzW6smHZiZ2k3J4k5b1VfXz3wen2FzsyFvb6LVasXZkuE/EYk74FhsTthuV3RxjxzCpUXQJ258t2SMKwAznl5yUp8i5JgsRXJz+SqmpvSqvQyChGxWAprnbustug1ooNadrZ8JWZhcLPaIy8T81sYXRj6oJGqAwfFOR3AC652KCywlBzeEZlN5ZcXAz48PNXtYOEj/B+q39E+iuux7yDqFhDTAOsQRJbOWRE7LpU/R+kGuaC8VHEFhdcEy4apjKdU3G4dQr11abTfQc9JPGTNbjnkasjX2Tk/gdzvA88yYPHNqWNnDMHMR4keI8VRrUiCQRBBIIOwixBVXEtcSHD3ht2nd1V6io8ron945cS7Ogcz738km1dh/VZmjtKh3ZfnvyB+h8OS1CN+W/aOaJP0NJEAjePvuQXUoyUi0i/j9Ug/p5fouZyBao5eSYsKM5nTgh5cPJCaQITaqNbbbyTOZ/lYcBLFEtRiE2qsYSAwpAKer9/dkxahyFhmazSjZvIvtWlh9Ik5Okd6z8XowOMix4W8Fn1NH1G5X5ZpimxLijp62lQ1usWzlkd/NUf268nJsbjPn+iw/a6jbG43OEpn4gHJscifsLJTz0bH6nUU9LtNnMI4tg+cINZoqZYgZizwW7e5c63FxvCsU8XO4/f3sS3JPsPo33YGuLgNePyn6woMxTxm145AkWzgixWS3ERkS3gMuEg2PUKyzSNUX12v3645WMEW4ZcCtdkl0ZsialLSk7Z++COMfwC52ppR1Qy9sjKRE8riw4CEzq9LY+qBugGOEnNarvVGbPRgnVLOOYkb89iZt7ak2Byy2C6FUBgiAIM91u5NSrkyIabTluv4qTAG0JTpWcZFtsxOyBnvO7I3UamsOFsv8J2vgGN2UdNuSfXFy7dsWpnFOrVLslCk6JUXETbI+SNTNMZgnrE9y1Deh6VA5TneBsic1KpIgRt2IrsRDYgNG4D7J6qo1rnuAbJPktMXPYWnT1jHAkrTw2BDQXAa0b3Bt9kDdwQsFQAdF/zEZjcL8QVbZQsWgEkk2E/fVY5JGd8EMNSm8Egcc1rDH+qtYWk8Om+AqnrAxjmEAOHZixi8mDsFs81WouIBLT2otMGw2Cd/wAlNKO/O7obHMeE+TosV6RONNrKbwD2WNBkxIAMk2B22tG66jj8XUJBqBxa7VaQS4FrpExJyJaDEwIzErm2YwmGVH9n3tYQXb84zyV1uPe4Fg1gxwPaJJl3wxuyIMW71O6FD5UF71vsBiqT2OcS12pLhJA7MG8kbMu8KDmrfpA4mmaDmlxaxxpu7U2J/wBOSIEk2/wFRpej9enh/WOBIHvCLtG/iPKR09KjVQi/dzayLuobW+Jh4nDTcZo2jtKFh1akxv2jnvHkjPaq9ai1wg23Hdz3hWOLXKJ4z8M6FhtLbjOPmPuFFzAcu77yXO4LGuou1XDs7v8Ak3eD93XR0arXgOaeo+/1C5PIzoGLcRu3Kcg5X8wpOG+x++8ITm9D4H6LAhFu49EzXxw4KQfvsd6ctWHDEA8PJRcwjP7+ilqEZXCTHxl3FccQCQRpaeB8EzqcIWgkyGqmNNLVUmlDtC3FWthwcwCqFbRTTlLTwW6mNMIlL1Ada8HL1dGvGUO8CqdSlGYIXYPw3D5oLsFO2RuWPaYoyOUBIyPenNYxBC36+h2H8p8FQr6IqNyuEO30OeV2jKaSMiQjDEP394CepSLfeaR0UICHa0dlMtBpPvHbtI6kk3Cb1eqZBtAyE9/eUkkoFskQCbfqh1qBIJJm27ikksb8A5w8FGU4SSWjwmsStPAUdRusbE5GLx8v8JJIk8cipvAY1Yy5nr5lTbXg6xMTs33npkO5JJLSyzIDVna7tYunju3KGuAMspvvvH1SSWMxdgjR1mzq5W5nbnyW3odtRzIOrTpgTOduDRnMJ0lt1awsjavmwbA0iaQudYQbg+BEkjytsUcL6SN7UNmRcl1piNWCL2Gyc0klCtNXJNteT0FLY8L0OXo1JlpzHiN6T2JJL6CLyjxZLDA1GBwh2Ww7W/UcEDD4h9B8Zg3jY4bCDv4pJIJ8cjK3lHS4XFMqtkfqD8j5ojxsP+eBTJLe0H0yDmfe0KLXRy++5JJCw0TadykQDnn95HamSWmEXUyOI8kzHkZHokksZxMOB/KfBJ1OPqkkuwdkjCkHpJLEsm9Dg7ipTvHUWKSSw0mBxnnYqLqXT737Uklm1G7mCqUAcwD99ypu0TSPw+fyTJLUY0sn/9k=')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <main className="min-h-screen pt-12 pb-20 relative z-10">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 px-6">
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur">
                <Shield className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs text-[#d4af37] font-semibold">AI-Powered Fraud Detection</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Find Your Dream Home
                <span className="text-[#d4af37]"> Safely</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Every property is AI-verified for authenticity. No scams, no surprises. 
                Secure escrow protects your payment until you verify in person.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  onClick={scrollToProperties}
                  className="bg-[#d4af37] hover:bg-[#c59b2b] text-black font-semibold px-8 h-12 text-base"
                >
                  Start Browsing
                  <TrendingUp className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  onClick={scrollToFeatures}
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base"
                >
                  How It Works
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="text-center p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-lg">
                <Shield className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-gray-300">Properties Verified</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-lg">
                <Zap className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">₿12.5K</div>
                <div className="text-xs text-gray-300">Scams Prevented</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-lg">
                <Award className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">1,200+</div>
                <div className="text-xs text-gray-300">Happy Tenants</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-lg">
                <CheckCircle className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">&lt; 2hrs</div>
                <div className="text-xs text-gray-300">Avg Response</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose <span className="text-[#d4af37]">BetAman</span>?
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                We combine blockchain technology with AI to make property rentals safe and transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 hover:border-[#d4af37]/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Shield className="w-7 h-7 text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Fraud Detection</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our AI analyzes images, prices, and descriptions to detect scams before you pay.
                </p>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 hover:border-[#d4af37]/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Lock className="w-7 h-7 text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Secure Escrow</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Funds are locked until you confirm property viewing. Full refund if listing is fake.
                </p>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 hover:border-[#d4af37]/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Award className="w-7 h-7 text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Reputation System</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Earn soulbound NFTs for successful transactions. Build trust in the community.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Properties Section */}
        <section id="properties-section" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Verified Properties</h2>
                <p className="text-gray-300">Browse AI-analyzed listings in Addis Ababa</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
                  All
                </Button>
                <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
                  Apartments
                </Button>
                <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
                  Houses
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PROPERTIES.map((prop) => (
                <Card 
                  key={prop.id} 
                  className="property-card bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden hover:border-[#d4af37]/50 transition-all group cursor-pointer hover:-translate-y-1 duration-300"
                  onClick={() => router.push(`/analysis/${prop.id}`)}
                >
                  <div className="h-56 bg-[#2d2d2d] relative overflow-hidden">
                    <img 
                      src={prop.image} 
                      alt={prop.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1a1a1a/d4af37?text=Property+Image';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <div className="px-2 py-1 bg-green-500/90 text-white text-xs font-semibold rounded flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        AI Verified
                      </div>
                      <div className="px-2 py-1 bg-[#d4af37]/90 text-black text-xs font-semibold rounded flex items-center gap-1">
                        <Star className="w-3 h-3 fill-black" />
                        {prop.score}%
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur rounded text-xs text-white">
                      🔒 Escrow Protected
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4af37] transition">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{prop.location}, Addis Ababa</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-[#d4af37] font-bold">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-lg">{prop.price.toLocaleString()} ETB</span>
                        <span className="text-xs text-gray-300">/mo</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-[#d4af37] hover:bg-[#c59b2b] text-black font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/analysis/${prop.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Analysis
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10"
                onClick={() => {
                  alert('More properties coming soon!');
                }}
              >
                Load More Properties
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                <Shield className="w-10 h-10 text-[#d4af37]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Find Your Safe Home?
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Join hundreds of tenants who found their perfect home without the fear of scams.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  onClick={scrollToProperties}
                  className="bg-[#d4af37] hover:bg-[#c59b2b] text-black font-semibold px-8 h-12"
                >
                  Browse Properties
                </Button>
                <Button 
                  onClick={scrollToFeatures}
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 px-8 h-12"
                >
                  Learn More
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}