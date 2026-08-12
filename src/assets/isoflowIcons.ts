import blockUrl from "./isoflow/block.svg";
import cacheUrl from "./isoflow/cache.svg";
import cardTerminalUrl from "./isoflow/cardterminal.svg";
import cloudUrl from "./isoflow/cloud.svg";
import cronjobUrl from "./isoflow/cronjob.svg";
import cubeUrl from "./isoflow/cube.svg";
import desktopUrl from "./isoflow/desktop.svg";
import diamondUrl from "./isoflow/diamond.svg";
import dnsUrl from "./isoflow/dns.svg";
import documentUrl from "./isoflow/document.svg";
import firewallUrl from "./isoflow/firewall.svg";
import functionModuleUrl from "./isoflow/function-module.svg";
import imageUrl from "./isoflow/image.svg";
import laptopUrl from "./isoflow/laptop.svg";
import loadBalancerUrl from "./isoflow/loadbalancer.svg";
import lockUrl from "./isoflow/lock.svg";
import mailUrl from "./isoflow/mail.svg";
import mailMultipleUrl from "./isoflow/mailmultiple.svg";
import mobileDeviceUrl from "./isoflow/mobiledevice.svg";
import officeUrl from "./isoflow/office.svg";
import packageModuleUrl from "./isoflow/package-module.svg";
import paymentCardUrl from "./isoflow/paymentcard.svg";
import planeUrl from "./isoflow/plane.svg";
import printerUrl from "./isoflow/printer.svg";
import pyramidUrl from "./isoflow/pyramid.svg";
import queueUrl from "./isoflow/queue.svg";
import routerUrl from "./isoflow/router.svg";
import serverUrl from "./isoflow/server.svg";
import speechUrl from "./isoflow/speech.svg";
import sphereUrl from "./isoflow/sphere.svg";
import storageUrl from "./isoflow/storage.svg";
import switchModuleUrl from "./isoflow/switch-module.svg";
import towerUrl from "./isoflow/tower.svg";
import truckUrl from "./isoflow/truck.svg";
import truckTwoUrl from "./isoflow/truck-2.svg";
import userUrl from "./isoflow/user.svg";
import vmUrl from "./isoflow/vm.svg";

export type IsoflowIcon = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
};

export const isoflowIcons: { icons: IsoflowIcon[] } = {
  icons: [
    { id: "block", name: "Block", url: blockUrl, width: 551.6, height: 343.8 },
    { id: "cache", name: "Cache", url: cacheUrl, width: 55.1, height: 57.3 },
    { id: "cardterminal", name: "Card terminal", url: cardTerminalUrl, width: 522.1, height: 616 },
    { id: "cloud", name: "Cloud", url: cloudUrl, width: 471.7, height: 508.4 },
    { id: "cronjob", name: "Cron job", url: cronjobUrl, width: 446.6, height: 470.7 },
    { id: "cube", name: "Cube", url: cubeUrl, width: 105.4, height: 93.9 },
    { id: "desktop", name: "Desktop", url: desktopUrl, width: 573.5, height: 570.4 },
    { id: "diamond", name: "Diamond", url: diamondUrl, width: 113.9, height: 105.8 },
    { id: "dns", name: "DNS", url: dnsUrl, width: 134, height: 122.4 },
    { id: "document", name: "Document", url: documentUrl, width: 451.2, height: 541.7 },
    { id: "firewall", name: "Firewall", url: firewallUrl, width: 578.5, height: 549.3 },
    { id: "function-module", name: "Function module", url: functionModuleUrl, width: 183.1, height: 136.6 },
    { id: "image", name: "Image", url: imageUrl, width: 451.2, height: 541.7 },
    { id: "laptop", name: "Laptop", url: laptopUrl, width: 541.1, height: 513.1 },
    { id: "loadbalancer", name: "Load balancer", url: loadBalancerUrl, width: 634.4, height: 548.1 },
    { id: "lock", name: "Lock", url: lockUrl, width: 203.9, height: 210 },
    { id: "mail", name: "Mail", url: mailUrl, width: 790.4, height: 622.9 },
    { id: "mailmultiple", name: "Multiple mail", url: mailMultipleUrl, width: 790.4, height: 622.9 },
    { id: "mobiledevice", name: "Mobile device", url: mobileDeviceUrl, width: 824.7, height: 850.9 },
    { id: "office", name: "Office", url: officeUrl, width: 51.2, height: 75.6 },
    { id: "package-module", name: "Package module", url: packageModuleUrl, width: 201.1, height: 200.8 },
    { id: "paymentcard", name: "Payment card", url: paymentCardUrl, width: 659.7, height: 441.5 },
    { id: "plane", name: "Plane", url: planeUrl, width: 248.44, height: 254.73 },
    { id: "printer", name: "Printer", url: printerUrl, width: 168.4, height: 154.8 },
    { id: "pyramid", name: "Pyramid", url: pyramidUrl, width: 552.5, height: 447.5 },
    { id: "queue", name: "Queue", url: queueUrl, width: 77.3, height: 63 },
    { id: "router", name: "Router", url: routerUrl, width: 518, height: 477 },
    { id: "server", name: "Server", url: serverUrl, width: 543.524, height: 508.851 },
    { id: "speech", name: "Speech", url: speechUrl, width: 206.8, height: 210.6 },
    { id: "sphere", name: "Sphere", url: sphereUrl, width: 242.3, height: 192.2 },
    { id: "storage", name: "Storage", url: storageUrl, width: 567.118, height: 554.586 },
    { id: "switch-module", name: "Switch module", url: switchModuleUrl, width: 701.4, height: 477 },
    { id: "tower", name: "Tower", url: towerUrl, width: 260.4, height: 517.7 },
    { id: "truck", name: "Truck", url: truckUrl, width: 240.81, height: 260.55 },
    { id: "truck-2", name: "Truck 2", url: truckTwoUrl, width: 243.55, height: 218.14 },
    { id: "user", name: "User", url: userUrl, width: 676.889, height: 638.628 },
    { id: "vm", name: "Virtual machine", url: vmUrl, width: 91.6, height: 84.4 },
  ],
};