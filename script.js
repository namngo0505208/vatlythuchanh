// --- GLOBAL STATE ---
let scene, camera, renderer, controls;
let isPlaying = false;
let timeScale = 1.0;
let animationFrameId = null;
let energyChart = null;

let activeCategory = 'daily';
let activePhenomenon = 'projectile';

let simObjects = {};
let trailLines = [];
let vectorHelpers = [];

// --- PHENOMENA DATABASE ---
const DATABASE = {
    mechanics: {
        title: "Cơ Học",
        icon: "fa-volleyball",
        items: {
            projectile: {
                name: "1. Ném Xiên Trong Không Trung",
                camera: [20, 15, 30],
                controls: [
                    { id: 'v0', name: 'Vận tốc đầu (v₀)', min: 5, max: 50, val: 25, unit: 'm/s' },
                    { id: 'angle', name: 'Góc ném (α)', min: 0, max: 90, val: 45, unit: '°' },
                    { id: 'mass', name: 'Khối lượng (m)', min: 0.1, max: 10, val: 1, unit: 'kg' },
                    { id: 'gravity', name: 'Trọng lực (g)', min: 1, max: 25, val: 9.8, unit: 'm/s²' },
                    { id: 'drag', name: 'Lực cản không khí', min: 0, max: 0.2, val: 0.02, unit: '', step: 0.005 }
                ]
            },
            pendulum: {
                name: "2. Con Lắc Đơn 3D",
                camera: [0, 8, 25],
                controls: [
                    { id: 'length', name: 'Chiều dài dây (L)', min: 2, max: 20, val: 10, unit: 'm' },
                    { id: 'initAngle', name: 'Góc lệch ban đầu', min: 10, max: 90, val: 45, unit: '°' },
                    { id: 'mass', name: 'Khối lượng quả cầu', min: 0.5, max: 10, val: 2, unit: 'kg' },
                    { id: 'gravity', name: 'Trọng lực (g)', min: 1, max: 25, val: 9.8, unit: 'm/s²' },
                    { id: 'damping', name: 'Lực cản ma sát', min: 0, max: 0.1, val: 0.005, unit: '', step: 0.001 }
                ]
            },
            doublePendulum: {
                name: "3. Con lắc đôi: chuyển động hỗn loạn",
                camera: [0, 5, 25],
                controls: [
                    { id: 'l1', name: 'Chiều dài Dây 1', min: 2, max: 10, val: 5, unit: 'm' },
                    { id: 'l2', name: 'Chiều dài Dây 2', min: 2, max: 10, val: 5, unit: 'm' },
                    { id: 'm1', name: 'Khối lượng Quả 1', min: 1, max: 10, val: 3, unit: 'kg' },
                    { id: 'm2', name: 'Khối lượng Quả 2', min: 1, max: 10, val: 2, unit: 'kg' }
                ]
            },
            spring: {
                name: "4. Dao Động Con Lắc Lò Xo",
                camera: [0, 5, 20],
                controls: [
                    { id: 'k', name: 'Độ cứng lò xo (k)', min: 5, max: 100, val: 35, unit: 'N/m' },
                    { id: 'mass', name: 'Khối lượng (m)', min: 0.5, max: 10, val: 2, unit: 'kg' },
                    { id: 'amplitude', name: 'Biên độ ban đầu (A)', min: 1, max: 8, val: 4, unit: 'm' },
                    { id: 'damping', name: 'Ma sát môi trường', min: 0, max: 0.2, val: 0.015, unit: '', step: 0.005 }
                ]
            },
            collision: {
                name: "5. Va Chạm Đàn Hồi 3D",
                camera: [0, 10, 25],
                controls: [
                    { id: 'm1', name: 'Khối lượng Cầu 1', min: 1, max: 10, val: 5, unit: 'kg' },
                    { id: 'v1', name: 'Vận tốc Cầu 1', min: 2, max: 20, val: 12, unit: 'm/s' },
                    { id: 'm2', name: 'Khối lượng Cầu 2', min: 1, max: 10, val: 2, unit: 'kg' },
                    { id: 'v2', name: 'Vận tốc Cầu 2', min: -20, max: 0, val: -6, unit: 'm/s' }
                ]
            },
            centripetal: {
                name: "6. Chuyển động tròn và lực hướng tâm",
                camera: [0, 15, 20],
                controls: [
                    { id: 'radius', name: 'Bán kính quay (R)', min: 2, max: 12, val: 6, unit: 'm' },
                    { id: 'omega', name: 'Tốc độ góc (ω)', min: 0.5, max: 10, val: 3, unit: 'rad/s' },
                    { id: 'mass', name: 'Khối lượng (m)', min: 0.5, max: 10, val: 2, unit: 'kg' }
                ]
            }
        }
    },
    em: {
        title: "Điện Từ",
        icon: "fa-bolt",
        items: {
            lorentz: {
                name: "1. Lực Lorentz Trong Từ Trường",
                camera: [0, 15, 30],
                controls: [
                    { id: 'charge', name: 'Điện tích hạt (q)', min: -5, max: 5, val: 2, unit: 'C' },
                    { id: 'bField', name: 'Từ trường (B)', min: 0.5, max: 10, val: 3, unit: 'Tesla' },
                    { id: 'v0', name: 'Vận tốc đầu (v₀)', min: 2, max: 20, val: 8, unit: 'm/s' },
                    { id: 'mass', name: 'Khối lượng hạt', min: 0.1, max: 5, val: 1, unit: 'kg' }
                ]
            },
            coulomb: {
                name: "2. Tương Tác Điện Trường Coulomb",
                camera: [0, 10, 25],
                controls: [
                    { id: 'q1', name: 'Điện tích Q1', min: -10, max: 10, val: 5, unit: 'μC' },
                    { id: 'q2', name: 'Điện tích Q2', min: -10, max: 10, val: -5, unit: 'μC' },
                    { id: 'dist', name: 'Khoảng cách ban đầu', min: 3, max: 15, val: 8, unit: 'm' }
                ]
            },
            emWave: {
                name: "3. Sóng Điện Từ Lượng Tử (E & B)",
                camera: [15, 10, 25],
                controls: [
                    { id: 'freq', name: 'Tần số sóng (f)', min: 0.5, max: 5, val: 1.5, unit: 'Hz' },
                    { id: 'amp', name: 'Biên độ sóng (A)', min: 1, max: 6, val: 3, unit: 'm' }
                ]
            }
        }
    },
    optics: {
        title: "Quang & Sóng",
        icon: "fa-wave-square",
        items: {
            waveInterference: {
                name: "1. Giao Thoa Sóng Nước 3D",
                camera: [0, 25, 30],
                controls: [
                    { id: 'freq', name: 'Tần số nguồn dao động', min: 1, max: 10, val: 4, unit: 'Hz' },
                    { id: 'dist', name: 'Khoảng cách 2 nguồn S1S2', min: 2, max: 12, val: 6, unit: 'm' }
                ]
            },
            refraction: {
                name: "2. Khúc Xạ Ánh Sáng Qua Lăng Kính",
                camera: [0, 10, 20],
                controls: [
                    { id: 'n1', name: 'Chiết suất Môi trường 1', min: 1, max: 2, val: 1, unit: 'n' },
                    { id: 'n2', name: 'Chiết suất Lăng kính', min: 1, max: 2.5, val: 1.5, unit: 'n', step: 0.05 },
                    { id: 'incAngle', name: 'Góc tới (i)', min: 5, max: 80, val: 45, unit: '°' }
                ]
            }
        }
    },
    thermo: {
        title: "Nhiệt & Chất Lưu",
        icon: "fa-temperature-high",
        items: {
            brownian: {
                name: "1. Chuyển Động Nhiệt Brown",
                camera: [0, 20, 35],
                controls: [
                    { id: 'temp', name: 'Nhiệt độ T (Vận tốc)', min: 1, max: 10, val: 4, unit: 'K' },
                    { id: 'count', name: 'Số lượng Phân tử', min: 10, max: 60, val: 35, unit: 'hạt', step: 5 }
                ]
            },
            buoyancy: {
                name: "2. Lực Đẩy Archimedes",
                camera: [0, 10, 25],
                controls: [
                    { id: 'fluidDensity', name: 'Khối lượng riêng chất lưu', min: 500, max: 1500, val: 1000, unit: 'kg/m³', step: 50 },
                    { id: 'objectDensity', name: 'Khối lượng riêng vật thể', min: 200, max: 2000, val: 700, unit: 'kg/m³', step: 50 }
                ]
            }
        }
    },
    astro: {
        title: "Thiên Văn",
        icon: "fa-globe",
        items: {
            gravity: {
                name: "1. Tương Tác Hấp Dẫn 3 Thiên Thể",
                camera: [0, 35, 35],
                controls: [
                    { id: 'gConst', name: 'Hằng số Hấp dẫn G', min: 1, max: 20, val: 6, unit: 'N m²/kg²' },
                    { id: 'm1', name: 'Khối lượng Sao Trung Tâm', min: 200, max: 2000, val: 1000, unit: 'kg' },
                    { id: 'm2', name: 'Khối lượng Hành tinh A', min: 1, max: 50, val: 10, unit: 'kg' },
                    { id: 'm3', name: 'Khối lượng Hành tinh B', min: 1, max: 50, val: 5, unit: 'kg' }
                ]
            },
            blackHole: {
                name: "2. Bẻ Cong Không-Thời Gian Lỗ Đen",
                camera: [0, 20, 30],
                controls: [
                    { id: 'mass', name: 'Khối lượng Lỗ Đen (M)', min: 100, max: 1000, val: 500, unit: 'M☉' },
                    { id: 'lightDist', name: 'Khoảng cách Tia Sáng', min: 5, max: 20, val: 12, unit: 'm' }
                ]
            }
        }
    },
    quantum: {
        title: "Lượng Tử",
        icon: "fa-atom",
        items: {
            bohrAtom: {
                name: "1. Mô Hình Nguyên Tử Bohr",
                camera: [0, 15, 25],
                controls: [
                    { id: 'zNum', name: 'Số hiệu Nguyên tử (Z)', min: 1, max: 6, val: 2, unit: 'protons' },
                    { id: 'nOrbit', name: 'Mức năng lượng (n)', min: 1, max: 4, val: 2, unit: 'quỹ đạo' }
                ]
            },
            doubleSlit: {
                name: "2. Thí nghiệm hai khe Young",
                camera: [0, 15, 25],
                controls: [
                    { id: 'slitDist', name: 'Khoảng cách 2 khe (d)', min: 1, max: 5, val: 2, unit: 'mm' },
                    { id: 'wavelength', name: 'Bước sóng ánh sáng (λ)', min: 400, max: 700, val: 550, unit: 'nm', step: 10 }
                ]
            }
        }
    }
};

DATABASE.daily = {
    title: "Đời Sống",
    icon: "fa-house",
    items: {
        projectile: {
            ...DATABASE.mechanics.items.projectile,
            name: "Ném bóng vào rổ",
            camera: [3, 8, 36],
            controls: DATABASE.mechanics.items.projectile.controls.map(control => ({
                ...control,
                val: control.id === 'v0' ? 9 : control.id === 'angle' ? 50 : control.val
            }))
        },
        pendulum: { ...DATABASE.mechanics.items.pendulum, name: "Đồng hồ quả lắc" },
        spring: {
            ...DATABASE.mechanics.items.spring,
            name: "Giảm xóc xe khi qua ổ gà",
            camera: [0, 6, 14],
            controls: DATABASE.mechanics.items.spring.controls.map(control => ({
                ...control,
                min: control.id === 'amplitude' ? 0.2 : control.min,
                max: control.id === 'amplitude' ? 0.6 : control.max,
                val: control.id === 'amplitude' ? 0.5 : control.val
            }))
        },
        centripetal: {
            ...DATABASE.mechanics.items.centripetal,
            name: "Xe đạp ôm cua",
            camera: [0, 9, 15],
            controls: DATABASE.mechanics.items.centripetal.controls.map(control => ({
                ...control,
                min: control.id === 'radius' ? 3 : control.min,
                max: control.id === 'radius' ? 8 : control.max,
                val: control.id === 'radius' ? 4.6 : control.val
            }))
        },
        refraction: { ...DATABASE.optics.items.refraction, name: "Ống hút trông như bị gãy trong cốc nước", camera: [0, 8, 14] },
        buoyancy: { ...DATABASE.thermo.items.buoyancy, name: "Vì sao thuyền nổi trên mặt nước?" }
    }
};

const LESSONS = {
    projectile: {
        context: "Ném bóng vào rổ, chuyền bóng hoặc phun nước từ vòi.",
        explain: "Sau khi rời tay, quả bóng vừa đi ngang vừa bị trọng lực kéo xuống. Góc ném và vận tốc đầu quyết định đường cong và tầm bay.",
        tryIt: "Thử tăng góc ném hoặc vận tốc đầu rồi quan sát quỹ đạo. Công thức tầm xa là giá trị lý tưởng khi bỏ qua lực cản."
    },
    pendulum: {
        context: "Đồng hồ quả lắc, xích đu.",
        explain: "Khi quả lắc đi xuống, thế năng chuyển thành động năng; khi lên cao, động năng lại đổi thành thế năng. Dây dài hơn làm nhịp lắc chậm hơn.",
        tryIt: "Thay đổi chiều dài dây để xem chu kỳ thay đổi. Công thức chu kỳ hiển thị là xấp xỉ cho góc nhỏ."
    },
    doublePendulum: {
        context: "Hai khớp nối chuyển động, đồ chơi treo nhiều tầng.",
        explain: "Chuyển động của quả thứ nhất ảnh hưởng đến quả thứ hai. Vì vậy chỉ một thay đổi nhỏ ban đầu cũng có thể làm đường đi khác hẳn.",
        tryIt: "Quan sát quỹ đạo khi chạy mô phỏng; đây là mô hình minh họa chuyển động hỗn loạn."
    },
    spring: {
        context: "Giảm xóc xe, nệm lò xo, bút bi bấm.",
        explain: "Lò xo bị kéo hoặc nén sẽ tạo lực kéo vật về vị trí cân bằng. Vật nặng hơn thường dao động chậm hơn; lò xo cứng hơn dao động nhanh hơn.",
        tryIt: "Thay đổi khối lượng và độ cứng lò xo để so sánh chu kỳ."
    },
    collision: {
        context: "Bi-a, bi ve, xe đồ chơi va vào nhau.",
        explain: "Trong va chạm đàn hồi lý tưởng, tổng động lượng và động năng được bảo toàn; khối lượng và vận tốc ban đầu quyết định hướng chuyển động sau va chạm.",
        tryIt: "Đổi khối lượng hoặc vận tốc để quan sát hai quả cầu đổi tốc độ sau va chạm."
    },
    centripetal: {
        context: "Xe đạp ôm cua, đu quay, vật buộc dây quay tròn.",
        explain: "Muốn vật đi theo đường tròn, cần có lực hướng vào tâm. Quay nhanh hơn hoặc đi theo vòng tròn lớn hơn thì lực cần thiết tăng.",
        tryIt: "Tăng tốc độ góc để xem lực hướng tâm tăng theo bình phương tốc độ góc."
    },
    lorentz: {
        context: "Hạt mang điện trong màn hình và thiết bị nghiên cứu.",
        explain: "Từ trường tác dụng lực lên hạt đang chuyển động; lực đổi hướng chuyển động nên quỹ đạo có thể cong.",
        tryIt: "Đổi dấu điện tích để quan sát chiều cong. Công thức hiển thị giả sử vận tốc vuông góc với từ trường."
    },
    coulomb: {
        context: "Lược hút giấy vụn sau khi chải tóc, quần áo bị hút dính.",
        explain: "Điện tích trái dấu hút nhau, cùng dấu đẩy nhau. Khoảng cách càng nhỏ thì lực điện càng lớn.",
        tryIt: "Đổi dấu hai điện tích và khoảng cách để xem độ lớn lực thay đổi."
    },
    emWave: {
        context: "Ánh sáng, sóng radio và tín hiệu Wi-Fi.",
        explain: "Sóng điện từ lan truyền năng lượng; tần số càng cao thì bước sóng càng ngắn.",
        tryIt: "Tăng tần số để thấy bước sóng tính được giảm."
    },
    waveInterference: {
        context: "Gợn sóng gặp nhau khi thả hai viên sỏi xuống nước.",
        explain: "Hai sóng có thể cộng hưởng làm gợn sóng cao hơn, hoặc triệt tiêu làm mặt nước yên hơn.",
        tryIt: "Thử thay đổi tần số và khoảng cách hai nguồn; muốn tính bước sóng chính xác cần biết vận tốc truyền sóng."
    },
    refraction: {
        context: "Ống hút nhìn như bị gãy trong cốc nước, ánh sáng qua lăng kính.",
        explain: "Ánh sáng đổi hướng khi đi từ môi trường này sang môi trường khác vì tốc độ truyền thay đổi.",
        tryIt: "Đổi chiết suất và góc tới để xem góc khúc xạ thay đổi theo định luật Snell."
    },
    brownian: {
        context: "Hạt bụi li ti rung động trong tia nắng, hạt phấn hoa chuyển động trong nước.",
        explain: "Các phân tử chuyển động nhiệt va chạm liên tục với hạt nhỏ, khiến hạt bị xô đẩy theo hướng ngẫu nhiên.",
        tryIt: "Tăng nhiệt độ mô phỏng để các hạt chuyển động nhanh hơn. Tốc độ ở đây là đơn vị minh họa."
    },
    buoyancy: {
        context: "Thuyền nổi, phao nổi, vật chìm trong nước.",
        explain: "Chất lỏng đẩy vật lên bằng lực Archimedes. Vật nổi khi lực đẩy cân bằng trọng lượng trước khi vật chìm hoàn toàn.",
        tryIt: "Thay đổi khối lượng riêng của nước và vật để tìm hiểu điều kiện nổi hoặc chìm."
    },
    gravity: {
        context: "Mặt Trăng quay quanh Trái Đất, các hành tinh quay quanh Mặt Trời.",
        explain: "Mọi vật có khối lượng hút nhau. Lực hấp dẫn mạnh hơn khi khối lượng lớn hơn và yếu đi nhanh khi khoảng cách tăng.",
        tryIt: "Thay đổi khối lượng các thiên thể; các giá trị trong mô phỏng được thu nhỏ để dễ quan sát."
    },
    blackHole: {
        context: "Ánh sáng bị bẻ cong khi đi gần một vật thể rất nặng.",
        explain: "Vật thể càng đặc và nặng thì ảnh hưởng hấp dẫn lên đường đi ánh sáng càng rõ. Mô hình dùng công thức gần đúng để minh họa.",
        tryIt: "Tăng khối lượng hoặc giảm khoảng cách tia sáng để so sánh góc lệch ước tính."
    },
    bohrAtom: {
        context: "Mô hình nguyên tử trong hóa học và vật liệu quanh ta.",
        explain: "Trong mô hình Bohr, electron chỉ có một số mức năng lượng xác định; mức n càng cao thì electron ở xa hạt nhân hơn.",
        tryIt: "Thay đổi số hiệu nguyên tử Z và mức n để xem bán kính và năng lượng thay đổi. Đây là mô hình đơn giản hóa."
    },
    doubleSlit: {
        context: "Vân sáng tối trong thí nghiệm ánh sáng; màu trên màng xà phòng là hiện tượng giao thoa liên quan.",
        explain: "Ánh sáng qua hai khe tạo hai sóng chồng lên nhau, hình thành các vân sáng và tối.",
        tryIt: "Thay đổi bước sóng hoặc khoảng cách hai khe; khoảng cách màn trong phép tính đang giả sử là 1 m."
    }
};

const DAILY_LESSONS = {
    projectile: {
        context: "Một cú ném bóng rổ.",
        explain: "Bóng bay theo đường cong vì chuyển động ngang kết hợp với trọng lực kéo bóng xuống.",
        tryIt: "Thử tăng góc ném hoặc tốc độ ném để xem bóng bay cao và xa hơn thế nào."
    },
    pendulum: {
        context: "Chiếc đồng hồ quả lắc trong nhà.",
        explain: "Mỗi nhịp lắc lặp lại sau một chu kỳ; dây dài hơn thì đồng hồ chạy nhịp chậm hơn.",
        tryIt: "Đổi chiều dài dây để so sánh chu kỳ của quả lắc."
    },
    spring: {
        context: "Giảm xóc giúp xe êm hơn khi qua ổ gà.",
        explain: "Lò xo hấp thụ dao động khi bánh xe gặp chỗ xóc; ma sát giúp dao động tắt dần.",
        tryIt: "Tăng hệ số ma sát để xem xe nhanh ổn định lại hơn."
    },
    centripetal: {
        context: "Cảm giác nghiêng người khi xe đạp ôm cua.",
        explain: "Xe cần lực hướng vào phía trong khúc cua để đổi hướng liên tục mà không đi thẳng.",
        tryIt: "Tăng tốc độ quay để xem lực hướng tâm tăng nhanh hơn."
    },
    refraction: {
        context: "Ống hút trông như bị lệch tại mặt nước trong cốc.",
        explain: "Ánh sáng đổi hướng khi đi từ nước ra không khí nên mắt nhìn thấy phần ống hút ở vị trí khác.",
        tryIt: "Thử đổi chiết suất nước và góc nhìn minh họa qua góc tới."
    },
    buoyancy: {
        context: "Một chiếc thuyền chở người vẫn nổi trên mặt nước.",
        explain: "Thuyền chiếm chỗ trong nước và nhận lực đẩy hướng lên; hình dạng rỗng làm thể tích chiếm chỗ lớn so với khối lượng.",
        tryIt: "So sánh khối lượng riêng vật và nước để tìm hiểu vì sao vật nổi hoặc chìm."
    }
};


// --- INIT THREE.JS SCENE ---
function initScene() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.012);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Ambient & Directional Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Cyber Floor Grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x67c9dc, 0xe2e8f0);
    scene.add(gridHelper);

    window.addEventListener('resize', onWindowResize);

    initChart();
    renderCategoryTabs();
    setupEventListeners();
    loadCategory('daily');
    animate();
}

// --- CHART.JS SETUP ---
function initChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');
    energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(30).fill(''),
            datasets: [
                { label: 'Thông số 1 (Ek)', data: Array(30).fill(0), borderColor: '#38bdf8', borderWidth: 1.5, pointRadius: 0 },
                { label: 'Thông số 2 (Ep)', data: Array(30).fill(0), borderColor: '#f43f5e', borderWidth: 1.5, pointRadius: 0 },
                { label: 'Tổng (E)', data: Array(30).fill(0), borderColor: '#10b981', borderWidth: 1.5, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: { x: { display: false }, y: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: 'rgba(148,163,184,0.25)' } } },
            plugins: { legend: { labels: { color: '#475569', font: { size: 9 }, boxWidth: 8 } } }
        }
    });
}

function updateChart(val1, val2) {
    if (!energyChart) return;
    const d1 = energyChart.data.datasets[0].data;
    const d2 = energyChart.data.datasets[1].data;
    const d3 = energyChart.data.datasets[2].data;

    d1.shift(); d1.push(val1);
    d2.shift(); d2.push(val2);
    d3.shift(); d3.push(val1 + val2);
    energyChart.update('none');
}

// --- UI CATEGORIES & NAVIGATION ---
function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    tabsContainer.innerHTML = '';

    const categories = ['daily', ...Object.keys(DATABASE).filter(key => key !== 'daily')];
    categories.forEach(catKey => {
        const cat = DATABASE[catKey];
        const btn = document.createElement('button');
        btn.className = `cat-tab-btn flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-semibold transition ${catKey === activeCategory ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`;
        btn.dataset.category = catKey;
        btn.innerHTML = `<i class="fa-solid ${cat.icon} text-sm mb-1"></i>${cat.title}`;
        btn.addEventListener('click', () => loadCategory(catKey));
        tabsContainer.appendChild(btn);
    });
}

function loadCategory(catKey) {
    activeCategory = catKey;
    document.querySelectorAll('.cat-tab-btn').forEach(btn => {
        const isActive = btn.dataset.category === catKey;
        btn.className = `cat-tab-btn flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-semibold transition ${isActive ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`;
    });

    const categoryData = DATABASE[catKey];
    const phenoSelect = document.getElementById('select-phenomenon');
    phenoSelect.innerHTML = '';

    Object.keys(categoryData.items).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = categoryData.items[key].name;
        phenoSelect.appendChild(opt);
    });

    activePhenomenon = Object.keys(categoryData.items)[0];
    updateSceneTitle();
    loadPhenomenonControls();
    resetSimulation();
}

function updateSceneTitle() {
    document.getElementById('scene-title').textContent = DATABASE[activeCategory].items[activePhenomenon].name;
}

function loadPhenomenonControls() {
    const container = document.getElementById('controls-container');
    container.innerHTML = '';

    const item = DATABASE[activeCategory].items[activePhenomenon];
    if (activeCategory === 'daily') {
        const focusTargets = {
            projectile: [-4.5, 3, 0],
            pendulum: [0, 10, 0],
            spring: [-1.2, 4.5, 0],
            centripetal: [-0.5, 1, 0],
            refraction: [-2.2, 2.5, 0],
            buoyancy: [-3, 5, 0]
        };
        const [targetX, targetY, targetZ] = focusTargets[activePhenomenon];
        controls.target.set(targetX, targetY, targetZ);
        camera.position.set(item.camera[0] + targetX, item.camera[1] + targetY, item.camera[2] + targetZ);
        controls.update();
    } else {
        controls.target.set(0, 0, 0);
        camera.position.set(...item.camera);
        controls.update();
    }

    item.controls.forEach(ctrl => {
        const step = ctrl.step || 0.1;
        container.innerHTML += `
            <div class="flex flex-col gap-1.5 glass-card p-2.5 rounded-xl border border-slate-800">
                <div class="flex justify-between items-center gap-2 text-xs">
                    <label for="input-${ctrl.id}" class="text-slate-300 font-medium">${ctrl.name}</label>
                    <span class="flex items-center gap-1.5 shrink-0">
                        <input type="number" id="input-${ctrl.id}" min="${ctrl.min}" max="${ctrl.max}" step="${step}" value="${ctrl.val}" aria-label="Nhập ${ctrl.name}" class="parameter-input rounded-md px-2 py-1 text-right font-bold">
                        <span class="text-slate-500">${ctrl.unit}</span>
                    </span>
                </div>
                <input type="range" id="${ctrl.id}" min="${ctrl.min}" max="${ctrl.max}" value="${ctrl.val}" step="${step}" 
                       class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400">
                <p id="error-${ctrl.id}" class="parameter-error hidden text-[10px]" role="alert">Nhập giá trị từ ${ctrl.min} đến ${ctrl.max}.</p>
            </div>
        `;
    });

    item.controls.forEach(ctrl => {
        const rangeInput = document.getElementById(ctrl.id);
        const numberInput = document.getElementById(`input-${ctrl.id}`);
        const errorMessage = document.getElementById(`error-${ctrl.id}`);
        const clearValidation = () => {
            numberInput.removeAttribute('aria-invalid');
            errorMessage.classList.add('hidden');
        };

        rangeInput.addEventListener('input', () => {
            numberInput.value = rangeInput.value;
            clearValidation();
            resetSimulation();
        });

        numberInput.addEventListener('input', () => {
            const value = Number(numberInput.value);
            if (numberInput.value === '' || !Number.isFinite(value) || value < ctrl.min || value > ctrl.max) {
                numberInput.setAttribute('aria-invalid', 'true');
                errorMessage.classList.remove('hidden');
                return;
            }

            clearValidation();
            rangeInput.value = String(value);
            resetSimulation();
        });
    });
}

function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) : 0;
}

function formatNumber(value, digits = 2) {
    return Number(value).toFixed(digits);
}

function renderFormulaCalculations(calculations) {
    const container = document.getElementById('formula-container');
    const html = calculations.map(({ equation, substitution, result }) => `
        <article class="formula-entry bg-white rounded-lg p-2.5">
            <p class="formula-equation text-[11px] font-semibold">${equation}</p>
            <p class="formula-substitution text-[10px] mt-1 break-words">${substitution}</p>
            <p class="formula-result text-[11px] font-bold mt-1">${result}</p>
        </article>
    `).join('');

    if (container.innerHTML !== html) container.innerHTML = html;
}

function updateLessonDisplay() {
    const lesson = activeCategory === 'daily'
        ? DAILY_LESSONS[activePhenomenon]
        : LESSONS[activePhenomenon];
    const container = document.getElementById('lesson-container');
    const html = `
        <p class="lesson-context text-[10px] font-semibold rounded-lg px-2.5 py-2">
            <i class="fa-solid fa-location-dot mr-1"></i>Gặp trong đời sống: ${lesson.context}
        </p>
        <p class="lesson-explain text-[11px] leading-relaxed mt-2">${lesson.explain}</p>
        <p class="lesson-try text-[10px] leading-relaxed mt-2 rounded-lg px-2.5 py-2">
            <span class="font-bold">Thử khám phá:</span> ${lesson.tryIt}
        </p>
    `;

    if (container.innerHTML !== html) container.innerHTML = html;
}

function updateFormulaDisplay() {
    updateLessonDisplay();
    const calculations = [];
    const addCalculation = (equation, substitution, result) => {
        calculations.push({ equation, substitution, result });
    };

    if (activePhenomenon === 'projectile') {
        const v0 = getInputValue('v0'), angle = getInputValue('angle'), g = getInputValue('gravity');
        const radians = angle * Math.PI / 180;
        addCalculation('H = v₀² sin²(α) / (2g)', `H = ${formatNumber(v0)}² × sin²(${formatNumber(angle, 1)}°) / (2 × ${formatNumber(g)})`, `Độ cao cực đại (bỏ qua lực cản): ${formatNumber(v0 ** 2 * Math.sin(radians) ** 2 / (2 * g))} m`);
        addCalculation('R = v₀² sin(2α) / g', `R = ${formatNumber(v0)}² × sin(${formatNumber(2 * angle, 1)}°) / ${formatNumber(g)}`, `Tầm xa lý tưởng (bỏ qua lực cản): ${formatNumber(v0 ** 2 * Math.sin(2 * radians) / g)} m`);
    } else if (activePhenomenon === 'pendulum') {
        const length = getInputValue('length'), gravity = getInputValue('gravity'), angle = getInputValue('initAngle');
        addCalculation('T = 2π√(L / g)', `T = 2π√(${formatNumber(length)} / ${formatNumber(gravity)})`, `Chu kỳ xấp xỉ: ${formatNumber(2 * Math.PI * Math.sqrt(length / gravity))} s (góc nhỏ)`);
        addCalculation('h = L(1 − cos α)', `h = ${formatNumber(length)} × (1 − cos ${formatNumber(angle, 1)}°)`, `Độ cao ban đầu: ${formatNumber(length * (1 - Math.cos(angle * Math.PI / 180)))} m`);
    } else if (activePhenomenon === 'doublePendulum') {
        const l1 = getInputValue('l1'), l2 = getInputValue('l2'), m1 = getInputValue('m1'), m2 = getInputValue('m2');
        addCalculation('U = m₁gh₁ + m₂gh₂; h₁ = L₁; h₂ = L₁ + L₂', `U = ${formatNumber(m1)} × 9.8 × ${formatNumber(l1)} + ${formatNumber(m2)} × 9.8 × (${formatNumber(l1)} + ${formatNumber(l2)})`, `Thế năng ban đầu (hai dây thẳng đứng): ${formatNumber(m1 * 9.8 * l1 + m2 * 9.8 * (l1 + l2))} J`);
        addCalculation('Chiều cao quả 2: h₂ = L₁ + L₂', `h₂ = ${formatNumber(l1)} + ${formatNumber(l2)}`, `h₂ = ${formatNumber(l1 + l2)} m`);
    } else if (activePhenomenon === 'spring') {
        const k = getInputValue('k'), mass = getInputValue('mass'), amplitude = getInputValue('amplitude');
        addCalculation('T = 2π√(m / k)', `T = 2π√(${formatNumber(mass)} / ${formatNumber(k)})`, `Chu kỳ riêng: ${formatNumber(2 * Math.PI * Math.sqrt(mass / k))} s`);
        addCalculation('E = ½kA²', `E = ½ × ${formatNumber(k)} × ${formatNumber(amplitude)}²`, `Cơ năng ban đầu: ${formatNumber(0.5 * k * amplitude ** 2)} J`);
    } else if (activePhenomenon === 'collision') {
        const m1 = getInputValue('m1'), m2 = getInputValue('m2'), v1 = getInputValue('v1'), v2 = getInputValue('v2');
        const v1After = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        const v2After = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
        addCalculation('v₁′ = ((m₁ − m₂)v₁ + 2m₂v₂) / (m₁ + m₂)', `v₁′ = ((${formatNumber(m1)} − ${formatNumber(m2)}) × ${formatNumber(v1)} + 2 × ${formatNumber(m2)} × ${formatNumber(v2)}) / (${formatNumber(m1)} + ${formatNumber(m2)})`, `Sau va chạm: v₁′ = ${formatNumber(v1After)} m/s`);
        addCalculation('v₂′ = ((m₂ − m₁)v₂ + 2m₁v₁) / (m₁ + m₂)', `v₂′ = ((${formatNumber(m2)} − ${formatNumber(m1)}) × ${formatNumber(v2)} + 2 × ${formatNumber(m1)} × ${formatNumber(v1)}) / (${formatNumber(m1)} + ${formatNumber(m2)})`, `Sau va chạm: v₂′ = ${formatNumber(v2After)} m/s`);
    } else if (activePhenomenon === 'centripetal') {
        const radius = getInputValue('radius'), omega = getInputValue('omega'), mass = getInputValue('mass');
        addCalculation('v = ωR', `v = ${formatNumber(omega)} × ${formatNumber(radius)}`, `Vận tốc dài: ${formatNumber(omega * radius)} m/s`);
        addCalculation('Fₕₜ = mω²R', `Fₕₜ = ${formatNumber(mass)} × ${formatNumber(omega)}² × ${formatNumber(radius)}`, `Lực hướng tâm: ${formatNumber(mass * omega ** 2 * radius)} N`);
    } else if (activePhenomenon === 'lorentz') {
        const charge = getInputValue('charge'), field = getInputValue('bField'), velocity = getInputValue('v0'), mass = getInputValue('mass');
        const force = Math.abs(charge) * velocity * field;
        addCalculation('F = |q|vB (v ⟂ B)', `F = |${formatNumber(charge)}| × ${formatNumber(velocity)} × ${formatNumber(field)}`, `Lực Lorentz ban đầu: ${formatNumber(force)} N`);
        addCalculation('r = mv / (|q|B)', `r = ${formatNumber(mass)} × ${formatNumber(velocity)} / (|${formatNumber(charge)}| × ${formatNumber(field)})`, charge === 0 ? 'q = 0 nên không có quỹ đạo tròn do lực từ.' : `Bán kính quỹ đạo lý tưởng: ${formatNumber(mass * velocity / force)} m`);
    } else if (activePhenomenon === 'coulomb') {
        const q1 = getInputValue('q1') * 1e-6, q2 = getInputValue('q2') * 1e-6, distance = getInputValue('dist');
        const force = 8.99e9 * Math.abs(q1 * q2) / distance ** 2;
        addCalculation('F = k|q₁q₂| / r²; k ≈ 8,99 × 10⁹', `F = 8,99 × 10⁹ × |(${formatNumber(q1, 8)})(${formatNumber(q2, 8)})| / ${formatNumber(distance)}²`, `Độ lớn lực Coulomb: ${formatNumber(force, 4)} N`);
        addCalculation('q (C) = q (μC) × 10⁻⁶', `q₁ = ${formatNumber(getInputValue('q1'))} μC; q₂ = ${formatNumber(getInputValue('q2'))} μC`, `Hai điện tích ${q1 * q2 < 0 ? 'trái dấu (hút nhau)' : q1 * q2 > 0 ? 'cùng dấu (đẩy nhau)' : 'có tích điện tích bằng 0'}.`);
    } else if (activePhenomenon === 'emWave') {
        const frequency = getInputValue('freq'), wavelength = 299792458 / frequency;
        addCalculation('λ = c / f; c ≈ 3 × 10⁸ m/s', `λ = 299.792.458 / ${formatNumber(frequency)} Hz`, `Bước sóng: ${formatNumber(wavelength)} m`);
        addCalculation('T = 1 / f', `T = 1 / ${formatNumber(frequency)}`, `Chu kỳ: ${formatNumber(1 / frequency)} s`);
    } else if (activePhenomenon === 'waveInterference') {
        const frequency = getInputValue('freq'), distance = getInputValue('dist');
        addCalculation('λ = v / f', `f = ${formatNumber(frequency)} Hz; khoảng cách hai nguồn S₁S₂ = ${formatNumber(distance)} m`, 'Chưa có vận tốc truyền sóng v trong dữ liệu đầu vào nên chưa thể tính số cụ thể cho λ.');
        addCalculation('Điều kiện cực đại: Δd = kλ', `Với f = ${formatNumber(frequency)} Hz`, 'Hai sóng tăng cường khi hiệu đường đi bằng bội số nguyên của bước sóng.');
    } else if (activePhenomenon === 'refraction') {
        const n1 = getInputValue('n1'), n2 = getInputValue('n2'), angle = getInputValue('incAngle');
        const sinRefraction = n1 * Math.sin(angle * Math.PI / 180) / n2;
        addCalculation('n₁ sin(i) = n₂ sin(r)', `sin(r) = ${formatNumber(n1)} × sin(${formatNumber(angle, 1)}°) / ${formatNumber(n2)}`, sinRefraction <= 1 ? `Góc khúc xạ: r = ${formatNumber(Math.asin(sinRefraction) * 180 / Math.PI, 1)}°` : 'Không có tia khúc xạ truyền qua (phản xạ toàn phần).');
    } else if (activePhenomenon === 'brownian') {
        const speed = getInputValue('temp'), count = getInputValue('count');
        addCalculation('v mỗi trục được chọn ngẫu nhiên trong [−T/2, T/2]', `Tốc độ mô phỏng T = ${formatNumber(speed)}; số hạt N = ${formatNumber(count, 0)}`, `Tốc độ hiệu dụng 3D ước tính: T/2 = ${formatNumber(speed / 2)} (đơn vị mô phỏng)`);
        addCalculation('N = số hạt được tạo trong mô phỏng', `N = ${formatNumber(count, 0)}`, `Số phân tử: ${formatNumber(count, 0)} hạt`);
    } else if (activePhenomenon === 'buoyancy') {
        const fluidDensity = getInputValue('fluidDensity'), objectDensity = getInputValue('objectDensity');
        const volume = activeCategory === 'daily' ? 12 : 27, gravity = 9.8;
        const volumeDescription = activeCategory === 'daily' ? 'thể tích mô hình thuyền ước tính' : 'thể tích vật hình lập phương (3³)';
        addCalculation('Fₐ = ρchất lỏng g Vchìm', `${volumeDescription}: V = ${volume} m³; Fₐ = ${formatNumber(fluidDensity, 0)} × 9,8 × ${volume}`, `Lực đẩy cực đại khi ngập hoàn toàn: ${formatNumber(fluidDensity * gravity * volume, 0)} N`);
        addCalculation('P = ρvật g V', `P = ${formatNumber(objectDensity, 0)} × 9,8 × ${volume}`, `Trọng lượng mô hình: ${formatNumber(objectDensity * gravity * volume, 0)} N; vật ${objectDensity < fluidDensity ? 'có xu hướng nổi' : objectDensity > fluidDensity ? 'có xu hướng chìm' : 'cân bằng khối lượng riêng'}.`);
    } else if (activePhenomenon === 'gravity') {
        const gravityConstant = getInputValue('gConst'), sunMass = getInputValue('m1'), planetMass = getInputValue('m2');
        const distance = 12;
        addCalculation('F = Gm₁m₂ / r²', `F = ${formatNumber(gravityConstant)} × ${formatNumber(sunMass)} × ${formatNumber(planetMass)} / ${distance}²`, `Lực hút Sun–hành tinh A ở vị trí ban đầu: ${formatNumber(gravityConstant * sunMass * planetMass / distance ** 2)} (đơn vị mô phỏng)`);
        addCalculation('a = F / m₂ = Gm₁ / r²', `a = ${formatNumber(gravityConstant)} × ${formatNumber(sunMass)} / ${distance}²`, `Gia tốc ban đầu của hành tinh A: ${formatNumber(gravityConstant * sunMass / distance ** 2)} (đơn vị mô phỏng)`);
    } else if (activePhenomenon === 'blackHole') {
        const massSolar = getInputValue('mass'), distance = getInputValue('lightDist');
        const schwarzschildRadius = 2 * 6.6743e-11 * massSolar * 1.9885e30 / 299792458 ** 2;
        const deflection = 2 * schwarzschildRadius / distance;
        addCalculation('rₛ = 2GM / c²', `M = ${formatNumber(massSolar)} M☉; M☉ = 1,9885 × 10³⁰ kg`, `Bán kính Schwarzschild: ${formatNumber(schwarzschildRadius / 1000)} km`);
        addCalculation('δ ≈ 2rₛ / b (xấp xỉ góc nhỏ)', `δ ≈ 2 × ${formatNumber(schwarzschildRadius)} / ${formatNumber(distance)}`, `Góc lệch ánh sáng ước tính: ${formatNumber(deflection)} rad (xấp xỉ yếu trường)`);
    } else if (activePhenomenon === 'bohrAtom') {
        const atomicNumber = getInputValue('zNum'), level = getInputValue('nOrbit');
        const radiusScale = level ** 2 / atomicNumber, energy = -13.6 * atomicNumber ** 2 / level ** 2;
        addCalculation('rₙ = n²a₀ / Z', `rₙ / a₀ = ${formatNumber(level, 0)}² / ${formatNumber(atomicNumber, 0)}`, `Bán kính quỹ đạo theo mô hình: ${formatNumber(radiusScale, 2)} a₀`);
        addCalculation('Eₙ = −13,6 Z² / n² (eV)', `Eₙ = −13,6 × ${formatNumber(atomicNumber, 0)}² / ${formatNumber(level, 0)}²`, `Mức năng lượng: ${formatNumber(energy)} eV`);
    } else if (activePhenomenon === 'doubleSlit') {
        const slitDistance = getInputValue('slitDist'), wavelength = getInputValue('wavelength');
        const fringeSpacing = wavelength * 0.001 / slitDistance;
        addCalculation('i = λL / d', `λ = ${formatNumber(wavelength, 0)} nm; d = ${formatNumber(slitDistance)} mm`, `Với khoảng cách màn L = 1 m: i = ${formatNumber(fringeSpacing, 3)} mm (đổi L để có kết quả thực tế khác).`);
        addCalculation('Vân sáng: xₖ = kλL / d', `Khoảng vân tỉ lệ thuận với λ = ${formatNumber(wavelength, 0)} nm và tỉ lệ nghịch với d = ${formatNumber(slitDistance)} mm`, 'Mô phỏng chưa có thông số khoảng cách từ hai khe đến màn.');
    }

    renderFormulaCalculations(calculations);
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('btn-toggle-controls').addEventListener('click', (event) => {
        const button = event.currentTarget;
        const panel = document.getElementById('controls-panel');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        button.setAttribute('aria-expanded', String(!isExpanded));
        button.setAttribute('aria-label', isExpanded ? 'Mở rộng bảng điều chỉnh' : 'Thu gọn bảng điều chỉnh');
        button.title = isExpanded ? 'Mở rộng bảng điều chỉnh' : 'Thu gọn bảng điều chỉnh';
        document.getElementById('icon-toggle-controls').className = isExpanded
            ? 'fa-solid fa-chevron-down'
            : 'fa-solid fa-chevron-up';
        panel.classList.toggle('is-collapsed', isExpanded);
    });

    document.getElementById('select-phenomenon').addEventListener('change', (e) => {
        activePhenomenon = e.target.value;
        updateSceneTitle();
        loadPhenomenonControls();
        resetSimulation();
    });

    document.getElementById('btn-play').addEventListener('click', () => {
        isPlaying = !isPlaying;
        document.getElementById('icon-play').className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        updateSimulationStatus();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        isPlaying = false;
        document.getElementById('icon-play').className = 'fa-solid fa-play';
        updateSimulationStatus();
        resetSimulation();
    });

    document.getElementById('select-speed').addEventListener('change', (e) => {
        timeScale = parseFloat(e.target.value);
    });

    document.getElementById('btn-default-params').addEventListener('click', () => {
        loadPhenomenonControls();
        resetSimulation();
    });

    // Live Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;

        for (const catKey in DATABASE) {
            for (const phenoKey in DATABASE[catKey].items) {
                if (DATABASE[catKey].items[phenoKey].name.toLowerCase().includes(query)) {
                    loadCategory(catKey);
                    document.getElementById('select-phenomenon').value = phenoKey;
                    activePhenomenon = phenoKey;
                    updateSceneTitle();
                    loadPhenomenonControls();
                    resetSimulation();
                    return;
                }
            }
        }
    });
}

function updateSimulationStatus() {
    const status = document.getElementById('simulation-status');
    status.classList.toggle('is-playing', isPlaying);
    document.getElementById('simulation-status-text').textContent = isPlaying ? 'ĐANG MÔ PHỎNG' : 'SẴN SÀNG';
    const playButton = document.getElementById('btn-play');
    playButton.classList.toggle('is-playing', isPlaying);
    playButton.setAttribute('aria-label', isPlaying ? 'Tạm dừng mô phỏng' : 'Bắt đầu mô phỏng');
}

// --- CLEAR SCENE ---
function clearSimObjects() {
    Object.values(simObjects).forEach(obj => {
        if (obj.isMesh || obj.isLine || obj.isGroup || obj.isPoints) scene.remove(obj);
    });
    simObjects = {};

    trailLines.forEach(line => scene.remove(line));
    trailLines = [];

    vectorHelpers.forEach(v => scene.remove(v));
    vectorHelpers = [];
}

function appendTrailPoint(position, color = 0x38bdf8) {
    if (!document.getElementById('toggle-trail').checked) return;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6 }));
    dot.position.copy(position);
    scene.add(dot);
    trailLines.push(dot);
    if (trailLines.length > 100) scene.remove(trailLines.shift());
}

function updateCoilSpring(line, lowerAnchor, upperAnchor) {
    const positions = line.geometry.attributes.position;
    const axis = upperAnchor.clone().sub(lowerAnchor);
    const length = axis.length();
    axis.normalize();
    const side = new THREE.Vector3(0, 0, 1).cross(axis).normalize();
    const otherSide = new THREE.Vector3().crossVectors(axis, side).normalize();
    const turns = 5;
    const segments = positions.count - 1;

    for (let index = 0; index <= segments; index++) {
        const progress = index / segments;
        const angle = progress * turns * Math.PI * 2;
        const point = lowerAnchor.clone().addScaledVector(axis, length * progress)
            .addScaledVector(side, Math.cos(angle) * 0.18)
            .addScaledVector(otherSide, Math.sin(angle) * 0.18);
        positions.setXYZ(index, point.x, point.y, point.z);
    }

    positions.needsUpdate = true;
    line.geometry.computeBoundingSphere();
}

// --- LAZY LOAD & BUILD SCENE PER PHENOMENON ---
function resetSimulation() {
    clearSimObjects();
    isPlaying = false;
    document.getElementById('icon-play').className = 'fa-solid fa-play';
    updateSimulationStatus();

    // CƠ HỌC
    if (activePhenomenon === 'projectile') {
        let ball;
        if (activeCategory === 'daily') {
            ball = new THREE.Group();
            const basketball = new THREE.Mesh(
                new THREE.SphereGeometry(0.6, 32, 32),
                new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.55 })
            );
            basketball.castShadow = true;
            ball.add(basketball);
            for (const rotation of [[0, 0, 0], [0, Math.PI / 2, 0], [Math.PI / 2, 0, 0]]) {
                const seam = new THREE.Mesh(
                    new THREE.TorusGeometry(0.56, 0.022, 6, 40),
                    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 })
                );
                seam.rotation.set(...rotation);
                ball.add(seam);
            }
        } else {
            ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 }));
            ball.castShadow = true;
        }
        scene.add(ball);
        const v0 = getInputValue('v0');
        const angleRad = (getInputValue('angle') * Math.PI) / 180;
        simObjects.ball = ball;
        const shotStart = activeCategory === 'daily' ? new THREE.Vector3(-5, 2.9, 0) : new THREE.Vector3(0, 0.6, 0);
        simObjects.state = { pos: shotStart, startX: shotStart.x, vel: new THREE.Vector3(v0 * Math.cos(angleRad), v0 * Math.sin(angleRad), 0), time: 0, scored: false, missed: false };
        if (activeCategory === 'daily') {
            const player = new THREE.Group();
            const skin = new THREE.MeshStandardMaterial({ color: 0xf2b992, roughness: 0.8 });
            const jersey = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.65 });
            const shorts = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });
            const shoes = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
            const addLimb = (start, end, radius, material) => {
                const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
                const limb = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 12), material);
                limb.position.copy(new THREE.Vector3(...start).add(new THREE.Vector3(...end)).multiplyScalar(0.5));
                limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
                limb.castShadow = true;
                player.add(limb);
            };

            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.5, 1.15, 20), jersey);
            torso.position.set(0, 1.48, 0);
            torso.castShadow = true;
            player.add(torso);

            const waist = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.38, 0.75), shorts);
            waist.position.set(0, 0.82, 0);
            player.add(waist);

            const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 20), skin);
            head.position.set(0.02, 2.32, 0);
            head.castShadow = true;
            player.add(head);
            const hair = new THREE.Mesh(
                new THREE.SphereGeometry(0.325, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
                new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
            );
            hair.position.copy(head.position);
            hair.rotation.z = -0.15;
            player.add(hair);

            for (const depth of [-0.23, 0.23]) {
                addLimb([-0.12, 0.75, depth], [-0.28, 0.16, depth], 0.14, shorts);
                const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.32), shoes);
                shoe.position.set(-0.12, 0.09, depth);
                shoe.castShadow = true;
                player.add(shoe);
            }

            addLimb([0, 1.88, 0.31], [0.42, 2.24, 0.31], 0.13, jersey);
            addLimb([0.42, 2.24, 0.31], [0.82, 2.83, 0.12], 0.11, skin);
            addLimb([0, 1.88, -0.31], [0.4, 2.14, -0.28], 0.13, jersey);
            addLimb([0.4, 2.14, -0.28], [0.78, 2.7, -0.12], 0.11, skin);
            player.position.set(-5.8, 0, 0);
            scene.add(player);
            simObjects.player = player;

            const hoop = new THREE.Group();
            const board = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 5, 7),
                new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
            );
            board.position.set(4.5, 5.2, 0);
            board.castShadow = true;
            hoop.add(board);

            const boardMarking = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 2.1, 3.2),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
            );
            boardMarking.position.set(4.34, 3.4, 0);
            hoop.add(boardMarking);

            const rim = new THREE.Mesh(
                new THREE.TorusGeometry(1.35, 0.12, 12, 48),
                new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.35, roughness: 0.35 })
            );
            rim.rotation.x = Math.PI / 2;
            rim.position.set(3, 2.9, 0);
            hoop.add(rim);

            const support = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.18, 0.18),
                new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 })
            );
            support.position.set(3.8, 5, 0);
            hoop.add(support);

            for (let index = 0; index < 8; index++) {
                const angle = (index / 8) * Math.PI * 2;
                const netLine = new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(3 + Math.cos(angle) * 1.2, 2.8, Math.sin(angle) * 1.2),
                        new THREE.Vector3(3 + Math.cos(angle) * 0.55, 1, Math.sin(angle) * 0.55)
                    ]),
                    new THREE.LineBasicMaterial({ color: 0x94a3b8 })
                );
                hoop.add(netLine);
            }

            scene.add(hoop);
            simObjects.hoop = hoop;

            const trajectoryPoints = [];
            const shotSpeed = getInputValue('v0');
            const shotAngle = (getInputValue('angle') * Math.PI) / 180;
            const gravity = getInputValue('gravity');
            for (let time = 0; time <= 1.8; time += 0.04) {
                const x = shotStart.x + shotSpeed * Math.cos(shotAngle) * time;
                const y = shotStart.y + shotSpeed * Math.sin(shotAngle) * time - 0.5 * gravity * time * time;
                if (y < 0.6 || x > 4) break;
                trajectoryPoints.push(new THREE.Vector3(x, y, 0));
            }
            const trajectory = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(trajectoryPoints),
                new THREE.LineDashedMaterial({ color: 0x7c3aed, dashSize: 0.28, gapSize: 0.16, transparent: true, opacity: 0.8 })
            );
            trajectory.computeLineDistances();
            scene.add(trajectory);
            simObjects.trajectory = trajectory;
        }

    } else if (activePhenomenon === 'pendulum') {
        const length = getInputValue('length');
        const initAngle = (getInputValue('initAngle') * Math.PI) / 180;
        const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        pivot.position.set(0, length + 2, 0); scene.add(pivot);
        const bob = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
        bob.castShadow = true; scene.add(bob);
        const rod = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xc1d5e0 }));
        scene.add(rod);
        simObjects.pivot = pivot; simObjects.bob = bob; simObjects.rod = rod;
        simObjects.state = { angle: initAngle, angularVel: 0, length: length };
        if (activeCategory === 'daily') {
            const clock = new THREE.Group();
            const face = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2, 0.3, 48),
                new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.6 })
            );
            face.rotation.x = Math.PI / 2;
            face.position.set(0, length + 4, -0.8);
            clock.add(face);

            const bezel = new THREE.Mesh(
                new THREE.TorusGeometry(2, 0.16, 12, 48),
                new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.45, roughness: 0.4 })
            );
            bezel.position.set(0, length + 4, -0.58);
            clock.add(bezel);

            for (let index = 0; index < 12; index++) {
                const angle = (index / 12) * Math.PI * 2;
                const marker = new THREE.Mesh(
                    new THREE.SphereGeometry(index % 3 === 0 ? 0.13 : 0.08, 12, 12),
                    new THREE.MeshStandardMaterial({ color: 0x7c2d12 })
                );
                marker.position.set(Math.sin(angle) * 1.55, length + 4 + Math.cos(angle) * 1.55, -0.35);
                clock.add(marker);
            }

            const hand = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, length + 4, -0.3),
                    new THREE.Vector3(0.2, length + 5.25, -0.3),
                    new THREE.Vector3(0.2, length + 5.25, -0.3),
                    new THREE.Vector3(-0.65, length + 4.35, -0.3)
                ]),
                new THREE.LineBasicMaterial({ color: 0x7c2d12, linewidth: 3 })
            );
            clock.add(hand);
            scene.add(clock);
            simObjects.clock = clock;
        }

    } else if (activePhenomenon === 'doublePendulum') {
        const l1 = getInputValue('l1'), l2 = getInputValue('l2');
        const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        pivot.position.set(0, 10, 0); scene.add(pivot);
        const bob1 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        const bob2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
        scene.add(bob1); scene.add(bob2);
        const rod1 = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
        const rod2 = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
        scene.add(rod1); scene.add(rod2);
        simObjects.pivot = pivot; simObjects.bob1 = bob1; simObjects.bob2 = bob2; simObjects.rod1 = rod1; simObjects.rod2 = rod2;
        simObjects.state = { a1: Math.PI / 2, a2: Math.PI / 2, a1_v: 0, a2_v: 0, l1: l1, l2: l2 };

    } else if (activePhenomenon === 'spring') {
        let mass;
        if (activeCategory === 'daily') {
            mass = new THREE.Group();
            const chassis = new THREE.Mesh(
                new THREE.BoxGeometry(3.5, 0.65, 1.8),
                new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.25, roughness: 0.35 })
            );
            chassis.position.y = 0.15;
            mass.add(chassis);

            const cabin = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.85, 1.45),
                new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.15, roughness: 0.3 })
            );
            cabin.position.set(-0.2, 0.88, 0);
            mass.add(cabin);

            const windshield = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.55, 1.12),
                new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.82, roughness: 0.15 })
            );
            windshield.position.set(0.76, 0.91, 0);
            mass.add(windshield);

            for (const side of [-1, 1]) {
                const window = new THREE.Mesh(
                    new THREE.BoxGeometry(0.95, 0.48, 0.06),
                    new THREE.MeshStandardMaterial({ color: 0xbae6fd, metalness: 0.1, roughness: 0.2 })
                );
                window.position.set(-0.2, 0.91, side * 0.74);
                mass.add(window);

                const doorLine = new THREE.Mesh(
                    new THREE.BoxGeometry(0.035, 0.72, 0.035),
                    new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.3 })
                );
                doorLine.position.set(0.68, 0.2, side * 0.9);
                mass.add(doorLine);
            }

            const bumper = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.16, 1.65),
                new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.45, roughness: 0.3 })
            );
            bumper.position.set(1.78, -0.12, 0);
            mass.add(bumper);

            const wheelAssembly = new THREE.Group();
            for (const x of [-1.1, 1.1]) {
                for (const z of [-0.95, 0.95]) {
                    const wheel = new THREE.Mesh(
                        new THREE.TorusGeometry(0.5, 0.15, 14, 28),
                        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
                    );
                    wheel.position.set(x, 4.68, z);
                    wheelAssembly.add(wheel);
                    const hub = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.13, 0.13, 0.12, 16),
                        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6 })
                    );
                    hub.rotation.x = Math.PI / 2;
                    hub.position.set(x, 4.68, z);
                    wheelAssembly.add(hub);
                }
            }
            scene.add(wheelAssembly);
            simObjects.wheels = wheelAssembly;

            const shockGroup = new THREE.Group();
            for (const x of [-1.1, 1.1]) {
                for (const z of [-0.95, 0.95]) {
                    const positions = new Float32Array(49 * 3);
                    const springGeometry = new THREE.BufferGeometry();
                    springGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    const spring = new THREE.Line(
                        springGeometry,
                        new THREE.LineBasicMaterial({ color: 0xf97316, linewidth: 3 })
                    );
                    spring.userData.anchor = { x, z };
                    shockGroup.add(spring);
                }
            }
            scene.add(shockGroup);
            simObjects.shockGroup = shockGroup;

            const road = new THREE.Mesh(
                new THREE.BoxGeometry(20, 0.18, 5),
                new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 })
            );
            road.position.set(0, 3.95, 0);
            scene.add(road);
            simObjects.road = road;

            const speedBump = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.12, 4.4),
                new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.65 })
            );
            speedBump.position.set(1.1, 4.1, 0);
            scene.add(speedBump);
            simObjects.speedBump = speedBump;
        } else {
            mass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        }
        scene.add(mass);
        const springLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfcb316, linewidth: 2 }));
        springLine.visible = activeCategory !== 'daily';
        scene.add(springLine);
        simObjects.mass = mass; simObjects.springLine = springLine;
        simObjects.state = { x: getInputValue('amplitude'), v: 0 };

    } else if (activePhenomenon === 'collision') {
        const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
        scene.add(ball1); scene.add(ball2);
        simObjects.ball1 = ball1; simObjects.ball2 = ball2;
        simObjects.state = { x1: -10, v1: getInputValue('v1'), m1: getInputValue('m1'), x2: 10, v2: getInputValue('v2'), m2: getInputValue('m2') };

    } else if (activePhenomenon === 'centripetal') {
        const center = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        scene.add(center);
        simObjects.center = center;
        let bob;
        if (activeCategory === 'daily') {
            bob = new THREE.Group();
            for (const wheelX of [-1.15, 1.15]) {
                const wheel = new THREE.Mesh(
                    new THREE.TorusGeometry(0.7, 0.11, 12, 32),
                    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
                );
                wheel.position.set(wheelX, 0, 0);
                bob.add(wheel);

                const hub = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.09, 0.09, 0.28, 12),
                    new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.45 })
                );
                hub.rotation.x = Math.PI / 2;
                hub.position.set(wheelX, 0, 0);
                bob.add(hub);
            }

            const frame = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(-1.15, 0, 0), new THREE.Vector3(-0.5, 0.85, 0),
                    new THREE.Vector3(0.5, 0.85, 0), new THREE.Vector3(1.15, 0, 0),
                    new THREE.Vector3(-1.15, 0, 0), new THREE.Vector3(0.5, 0.85, 0),
                    new THREE.Vector3(-0.5, 0.85, 0), new THREE.Vector3(0.15, 0, 0),
                    new THREE.Vector3(0.15, 0, 0), new THREE.Vector3(1.15, 0, 0)
                ]),
                new THREE.LineBasicMaterial({ color: 0xf97316, linewidth: 4 })
            );
            bob.add(frame);

            const handlebar = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0.5, 0.85, 0), new THREE.Vector3(0.82, 1.25, 0),
                    new THREE.Vector3(0.55, 1.3, 0), new THREE.Vector3(1.05, 1.3, 0)
                ]),
                new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 4 })
            );
            bob.add(handlebar);

            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.12, 0.28),
                new THREE.MeshStandardMaterial({ color: 0x334155 })
            );
            seat.position.set(-0.62, 1.02, 0);
            bob.add(seat);

            const cyclist = new THREE.Group();
            const riderClothes = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.75 });
            const riderSkin = new THREE.MeshStandardMaterial({ color: 0xf2b992, roughness: 0.8 });
            const riderHelmet = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 });
            const riderLimb = (start, end, radius, material) => {
                const startPoint = new THREE.Vector3(...start);
                const direction = new THREE.Vector3(...end).sub(startPoint);
                const limb = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 12), material);
                limb.position.copy(startPoint).addScaledVector(direction, 0.5);
                limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
                cyclist.add(limb);
            };

            const riderTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.3, 0.85, 16), riderClothes);
            riderTorso.position.set(0.03, 1.65, 0);
            riderTorso.rotation.z = -0.42;
            riderTorso.castShadow = true;
            cyclist.add(riderTorso);

            const riderHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), riderSkin);
            riderHead.position.set(0.58, 2.16, 0);
            riderHead.castShadow = true;
            cyclist.add(riderHead);
            const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.29, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), riderHelmet);
            helmet.position.set(0.58, 2.2, 0);
            cyclist.add(helmet);

            for (const side of [-0.12, 0.12]) {
                riderLimb([-0.2, 1.18, side], [-0.55, 0.52, side], 0.1, riderClothes);
                riderLimb([-0.55, 0.52, side], [0.05, 0.25, side], 0.085, riderSkin);
                riderLimb([0.18, 1.72, side], [0.63, 1.45, side], 0.09, riderClothes);
                riderLimb([0.63, 1.45, side], [0.93, 1.3, side], 0.075, riderSkin);
            }
            bob.add(cyclist);

            const pathPoints = [];
            for (let index = 0; index < 96; index++) {
                const angle = (index / 96) * Math.PI * 2;
                pathPoints.push(new THREE.Vector3(
                    getInputValue('radius') * Math.cos(angle),
                    1.27,
                    getInputValue('radius') * Math.sin(angle)
                ));
            }
            const path = new THREE.LineLoop(
                new THREE.BufferGeometry().setFromPoints(pathPoints),
                new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.65 })
            );
            scene.add(path);
            simObjects.path = path;

            const track = new THREE.Mesh(
                new THREE.RingGeometry(getInputValue('radius') - 1.15, getInputValue('radius') + 1.15, 96),
                new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95, side: THREE.DoubleSide })
            );
            track.rotation.x = -Math.PI / 2;
            track.position.y = 1.2;
            scene.add(track);
            simObjects.track = track;

            const trackEdge = new THREE.Mesh(
                new THREE.RingGeometry(getInputValue('radius') + 1.16, getInputValue('radius') + 1.2, 96),
                new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
            );
            trackEdge.rotation.x = -Math.PI / 2;
            trackEdge.position.y = 1.22;
            scene.add(trackEdge);
            simObjects.trackEdge = trackEdge;
        } else {
            bob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
        }
        scene.add(bob);
        const rod = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x38bdf8 }));
        rod.visible = activeCategory !== 'daily';
        scene.add(rod);
        simObjects.bob = bob; simObjects.rod = rod;
        simObjects.state = { angle: 0 };

    // ĐIỆN TỪ
    } else if (activePhenomenon === 'lorentz') {
        const particle = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 }));
        scene.add(particle);
        simObjects.particle = particle;
        simObjects.state = { pos: new THREE.Vector3(0, 5, 0), vel: new THREE.Vector3(getInputValue('v0'), 0, 2) };

    } else if (activePhenomenon === 'coulomb') {
        const q1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: getInputValue('q1') >= 0 ? 0xf43f5e : 0x38bdf8 }));
        const q2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: getInputValue('q2') >= 0 ? 0xf43f5e : 0x38bdf8 }));
        scene.add(q1); scene.add(q2);
        simObjects.q1 = q1; simObjects.q2 = q2;
        simObjects.state = { pos1: new THREE.Vector3(-getInputValue('dist')/2, 3, 0), pos2: new THREE.Vector3(getInputValue('dist')/2, 3, 0) };

    } else if (activePhenomenon === 'emWave') {
        const pointsE = [], pointsB = [];
        for (let x = -15; x <= 15; x += 0.3) {
            pointsE.push(new THREE.Vector3(x, 0, 0));
            pointsB.push(new THREE.Vector3(x, 0, 0));
        }
        const lineE = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsE), new THREE.LineBasicMaterial({ color: 0xf43f5e }));
        const lineB = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsB), new THREE.LineBasicMaterial({ color: 0x38bdf8 }));
        scene.add(lineE); scene.add(lineB);
        simObjects.lineE = lineE; simObjects.lineB = lineB;
        simObjects.state = { t: 0 };

    // QUANG & SÓNG
    } else if (activePhenomenon === 'waveInterference') {
        const gridGeo = new THREE.PlaneGeometry(30, 30, 40, 40);
        const gridMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, wireframe: true });
        const plane = new THREE.Mesh(gridGeo, gridMat);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);
        simObjects.plane = plane;
        simObjects.state = { t: 0 };

    } else if (activePhenomenon === 'refraction') {
        let prism;
        if (activeCategory === 'daily') {
            prism = new THREE.Group();
            const glass = new THREE.Mesh(
                new THREE.CylinderGeometry(2.2, 1.8, 5, 40, 1, true),
                new THREE.MeshPhysicalMaterial({ color: 0xbfdbfe, transmission: 0.82, opacity: 0.42, transparent: true, roughness: 0.12, side: THREE.DoubleSide })
            );
            glass.position.y = 2.5;
            prism.add(glass);

            const rim = new THREE.Mesh(
                new THREE.TorusGeometry(2.17, 0.1, 12, 48),
                new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.35, roughness: 0.28 })
            );
            rim.rotation.x = Math.PI / 2;
            rim.position.y = 5;
            prism.add(rim);

            const water = new THREE.Mesh(
                new THREE.CylinderGeometry(2.02, 1.72, 2.7, 40),
                new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.48, roughness: 0.18, metalness: 0.08 })
            );
            water.position.y = 1.55;
            prism.add(water);

            const strawMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const addStrawSection = (start, end) => {
                const startPoint = new THREE.Vector3(...start);
                const endPoint = new THREE.Vector3(...end);
                const direction = endPoint.clone().sub(startPoint);
                const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, direction.length(), 20), strawMaterial);
                straw.position.copy(startPoint).addScaledVector(direction, 0.5);
                straw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
                straw.castShadow = true;
                prism.add(straw);

                for (const fraction of [0.16, 0.32, 0.48, 0.64, 0.8]) {
                    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 8, 20), stripeMaterial);
                    stripe.position.copy(startPoint).lerp(endPoint, fraction);
                    stripe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.clone().normalize());
                    prism.add(stripe);
                }
            };
            addStrawSection([-1.65, 6.7, 1.88], [-0.45, 2.92, 1.88]);
            addStrawSection([0.6, 0.35, 1.88], [-0.45, 2.92, 1.88]);

            const waterline = new THREE.Mesh(
                new THREE.TorusGeometry(1.88, 0.045, 8, 48),
                new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.75 })
            );
            waterline.rotation.x = Math.PI / 2;
            waterline.position.y = 2.91;
            prism.add(waterline);

            const coaster = new THREE.Mesh(
                new THREE.CylinderGeometry(2.25, 2.25, 0.12, 48),
                new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.1 })
            );
            coaster.position.y = 0.02;
            prism.add(coaster);
            scene.add(prism);
        } else {
            prism = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 6, 3), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, opacity: 1, transparent: true, roughness: 0 }));
            prism.position.set(0, 3, 0); scene.add(prism);
        }
        const rayLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfcb316, linewidth: 3 }));
        rayLine.visible = activeCategory !== 'daily';
        scene.add(rayLine);
        simObjects.prism = prism; simObjects.rayLine = rayLine;

    // NHIỆT & CHẤT LƯU
    } else if (activePhenomenon === 'brownian') {
        const count = getInputValue('count'), speed = getInputValue('temp');
        const particles = [];
        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }));
            p.position.set((Math.random() - 0.5) * 14, Math.random() * 10 + 1, (Math.random() - 0.5) * 14);
            scene.add(p);
            particles.push({ mesh: p, vel: new THREE.Vector3((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed) });
        }
        simObjects.particles = particles;

    } else if (activePhenomenon === 'buoyancy') {
        const water = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 }));
        water.position.set(0, 4, 0); scene.add(water);
        let block;
        if (activeCategory === 'daily') {
            block = new THREE.Group();
            const hullShape = new THREE.Shape();
            hullShape.moveTo(-3, 0.55);
            hullShape.lineTo(3, 0.55);
            hullShape.lineTo(2.25, -0.45);
            hullShape.quadraticCurveTo(0, -1.05, -2.25, -0.45);
            hullShape.closePath();
            const hull = new THREE.Mesh(
                new THREE.ExtrudeGeometry(hullShape, { depth: 1.6, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.12, bevelThickness: 0.12 }),
                new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.12, roughness: 0.4 })
            );
            hull.geometry.translate(0, 0.25, -0.8);
            hull.castShadow = true;
            block.add(hull);

            const deck = new THREE.Mesh(
                new THREE.BoxGeometry(4.7, 0.2, 1.45),
                new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.62 })
            );
            deck.position.y = 0.42;
            block.add(deck);

            const cabin = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.15, 1.2),
                new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
            );
            cabin.position.set(-0.25, 1, 0);
            block.add(cabin);

            const window = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.58, 0.83),
                new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.12, roughness: 0.18 })
            );
            window.position.set(0.53, 1.08, 0);
            block.add(window);

            const mast = new THREE.Mesh(
                new THREE.CylinderGeometry(0.07, 0.07, 2.8, 12),
                new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 })
            );
            mast.position.set(-1.65, 1.45, 0);
            block.add(mast);

            const flag = new THREE.Mesh(
                new THREE.ConeGeometry(0.45, 0.9, 3),
                new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.45 })
            );
            flag.position.set(-1.65, 2.55, 0);
            flag.rotation.z = -Math.PI / 2;
            block.add(flag);
        } else {
            block = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
        }
        scene.add(block);
        simObjects.water = water; simObjects.block = block;
        simObjects.state = { y: activeCategory === 'daily' ? 8 : 10, v: 0 };

    // THIÊN VĂN
    } else if (activePhenomenon === 'gravity') {
        const sun = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfcb316 }));
        const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
        scene.add(sun); scene.add(p1); scene.add(p2);
        simObjects.sun = sun; simObjects.p1 = p1; simObjects.p2 = p2;
        simObjects.state = {
            sun: { pos: new THREE.Vector3(0, 5, 0), vel: new THREE.Vector3(0, 0, 0), mass: getInputValue('m1') },
            p1: { pos: new THREE.Vector3(12, 5, 0), vel: new THREE.Vector3(0, 0, 6), mass: getInputValue('m2') },
            p2: { pos: new THREE.Vector3(-18, 5, 0), vel: new THREE.Vector3(0, 0, -4.5), mass: getInputValue('m3') }
        };

    } else if (activePhenomenon === 'blackHole') {
        const bh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        const ring = new THREE.Mesh(new THREE.RingGeometry(3, 6, 32), new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide }));
        ring.rotation.x = Math.PI / 3; scene.add(bh); scene.add(ring);
        simObjects.bh = bh; simObjects.ring = ring;

    // LƯỢNG TỬ
    } else if (activePhenomenon === 'bohrAtom') {
        const nucleus = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        scene.add(nucleus);
        const electron = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 }));
        scene.add(electron);
        simObjects.nucleus = nucleus; simObjects.electron = electron;
        simObjects.state = { angle: 0 };

    } else if (activePhenomenon === 'doubleSlit') {
        const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.2, 10, 15), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        barrier.position.set(-5, 5, 0); scene.add(barrier);
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.2, 12, 18), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        screen.position.set(10, 5, 0); scene.add(screen);
        simObjects.barrier = barrier; simObjects.screen = screen;
    }

    updatePhysics(0);
}

// --- PHYSICS COMPUTATION ENGINE ---
function updatePhysics(dt) {
    const metrics = document.getElementById('metrics-container');

    if (activePhenomenon === 'projectile') {
        const s = simObjects.state, g = getInputValue('gravity'), m = getInputValue('mass'), drag = getInputValue('drag');
        const previousX = s.pos.x;
        if (isPlaying && s.pos.y >= 0.6) {
            const dragForce = s.vel.clone().multiplyScalar(-drag);
            const totalForce = new THREE.Vector3(0, -m * g, 0).add(dragForce);
            s.vel.add(totalForce.divideScalar(m).multiplyScalar(dt));
            s.pos.add(s.vel.clone().multiplyScalar(dt));
            s.time += dt;
            appendTrailPoint(s.pos);
        }
        if (activeCategory === 'daily' && !s.scored && previousX < 3 && s.pos.x >= 3) {
            s.scored = Math.abs(s.pos.y - 2.9) <= 0.75 && Math.abs(s.pos.z) <= 0.75;
            if (s.scored) {
                s.pos.x = 3;
                s.vel.x = 0;
                s.vel.z = 0;
            }
        }
        if (activeCategory === 'daily' && s.time > 0 && s.pos.y < 0.6 && !s.scored) s.missed = true;
        if (s.pos.y < 0.6) {
            s.pos.y = 0.6;
            s.vel.set(0, 0, 0);
            if (activeCategory === 'daily' && isPlaying) {
                isPlaying = false;
                document.getElementById('icon-play').className = 'fa-solid fa-play';
                updateSimulationStatus();
            }
        }
        simObjects.ball.position.copy(s.pos);
        const v = s.vel.length(), h = Math.max(0, s.pos.y - 0.6);
        const horizontalDistance = activeCategory === 'daily' ? s.pos.x - s.startX : s.pos.x;
        updateChart(0.5 * m * v * v, m * g * h);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Độ cao Y</span><span class="text-cyan-400 font-bold">${h.toFixed(2)} m</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Tầm xa X</span><span class="text-cyan-400 font-bold">${horizontalDistance.toFixed(2)} m</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc</span><span class="text-cyan-400 font-bold">${v.toFixed(2)} m/s</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Thời gian</span><span class="text-cyan-400 font-bold">${s.time.toFixed(2)} s</span></div>
            ${activeCategory === 'daily' ? `<div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Kết quả cú ném</span><span class="text-cyan-400 font-bold">${s.scored ? '🏀 Bóng đã vào rổ!' : s.missed ? 'Thử lại để ném trúng rổ' : s.time > 0 ? 'Bóng đang bay đến rổ...' : 'Sẵn sàng ném bóng'}</span></div>` : ''}
        `;

    } else if (activePhenomenon === 'pendulum') {
        const s = simObjects.state, g = getInputValue('gravity'), m = getInputValue('mass');
        if (isPlaying) {
            const alpha = -(g / s.length) * Math.sin(s.angle) - getInputValue('damping') * s.angularVel;
            s.angularVel += alpha * dt;
            s.angle += s.angularVel * dt;
        }
        const pPos = simObjects.pivot.position;
        const bobPos = new THREE.Vector3(pPos.x + s.length * Math.sin(s.angle), pPos.y - s.length * Math.cos(s.angle), pPos.z);
        simObjects.bob.position.copy(bobPos);
        simObjects.rod.geometry.setFromPoints([pPos, bobPos]);
        if (isPlaying) appendTrailPoint(bobPos, 0xf43f5e);
        const v = Math.abs(s.angularVel * s.length), h = s.length * (1 - Math.cos(s.angle));
        updateChart(0.5 * m * v * v, m * g * h);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Góc lệch</span><span class="text-cyan-400 font-bold">${((s.angle * 180) / Math.PI).toFixed(1)}°</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc góc</span><span class="text-cyan-400 font-bold">${s.angularVel.toFixed(2)} rad/s</span></div>
        `;

    } else if (activePhenomenon === 'doublePendulum') {
        const s = simObjects.state, g = 9.8, m1 = getInputValue('m1'), m2 = getInputValue('m2');
        if (isPlaying) {
            const num1 = -g * (2 * m1 + m2) * Math.sin(s.a1) - m2 * g * Math.sin(s.a1 - 2 * s.a2) - 2 * Math.sin(s.a1 - s.a2) * m2 * (s.a2_v * s.a2_v * s.l2 + s.a1_v * s.a1_v * s.l1 * Math.cos(s.a1 - s.a2));
            const den1 = s.l1 * (2 * m1 + m2 - m2 * Math.cos(2 * s.a1 - 2 * s.a2));
            const a1_a = num1 / den1;
            const num2 = 2 * Math.sin(s.a1 - s.a2) * (s.a1_v * s.a1_v * s.l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(s.a1) + s.a2_v * s.a2_v * s.l2 * m2 * Math.cos(s.a1 - s.a2));
            const den2 = s.l2 * (2 * m1 + m2 - m2 * Math.cos(2 * s.a1 - 2 * s.a2));
            const a2_a = num2 / den2;

            s.a1_v += a1_a * dt; s.a2_v += a2_a * dt;
            s.a1 += s.a1_v * dt; s.a2 += s.a2_v * dt;
        }
        const p = simObjects.pivot.position;
        const x1 = p.x + s.l1 * Math.sin(s.a1), y1 = p.y - s.l1 * Math.cos(s.a1);
        const x2 = x1 + s.l2 * Math.sin(s.a2), y2 = y1 - s.l2 * Math.cos(s.a2);
        simObjects.bob1.position.set(x1, y1, 0); simObjects.bob2.position.set(x2, y2, 0);
        simObjects.rod1.geometry.setFromPoints([p, new THREE.Vector3(x1, y1, 0)]);
        simObjects.rod2.geometry.setFromPoints([new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)]);
        if (isPlaying) appendTrailPoint(new THREE.Vector3(x2, y2, 0), 0xf43f5e);
        metrics.innerHTML = `<div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Trạng thái</span><span class="text-cyan-400 font-bold">Chuyển động Hỗn độn (Chaos)</span></div>`;

    } else if (activePhenomenon === 'spring') {
        const s = simObjects.state, k = getInputValue('k'), m = getInputValue('mass');
        if (isPlaying) {
            const accel = (-k * s.x - getInputValue('damping') * s.v) / m;
            s.v += accel * dt; s.x += s.v * dt;
        }
        const bodyHeight = activeCategory === 'daily' ? 5.2 : 5;
        simObjects.mass.position.set(s.x, bodyHeight, 0);
        if (activeCategory === 'daily') {
            simObjects.shockGroup.children.forEach(spring => {
                const { x, z } = spring.userData.anchor;
                updateCoilSpring(spring, new THREE.Vector3(x, 4.68, z), new THREE.Vector3(x, bodyHeight + s.x + 0.3, z));
            });
        } else {
            const points = [];
            for (let i = 0; i <= 12; i++) {
                points.push(new THREE.Vector3(-10 + (s.x + 10) * (i / 12), bodyHeight + (i % 2 === 0 ? 0.4 : -0.4), 0));
            }
            simObjects.springLine.geometry.setFromPoints(points);
        }
        updateChart(0.5 * m * s.v * s.v, 0.5 * k * s.x * s.x);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Li độ (x)</span><span class="text-cyan-400 font-bold">${s.x.toFixed(2)} m</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc (v)</span><span class="text-cyan-400 font-bold">${s.v.toFixed(2)} m/s</span></div>
        `;

    } else if (activePhenomenon === 'collision') {
        const s = simObjects.state;
        if (isPlaying) {
            s.x1 += s.v1 * dt; s.x2 += s.v2 * dt;
            if (s.x1 + 0.8 >= s.x2 - 0.8) {
                const v1New = ((s.m1 - s.m2) * s.v1 + 2 * s.m2 * s.v2) / (s.m1 + s.m2);
                const v2New = ((s.m2 - s.m1) * s.v2 + 2 * s.m1 * s.v1) / (s.m1 + s.m2);
                s.v1 = v1New; s.v2 = v2New;
            }
        }
        simObjects.ball1.position.set(s.x1, 1, 0); simObjects.ball2.position.set(s.x2, 1, 0);
        updateChart(0.5 * s.m1 * s.v1 * s.v1, 0.5 * s.m2 * s.v2 * s.v2);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">V1 Quả Cầu 1</span><span class="text-cyan-400 font-bold">${s.v1.toFixed(2)} m/s</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">V2 Quả Cầu 2</span><span class="text-cyan-400 font-bold">${s.v2.toFixed(2)} m/s</span></div>
        `;

    } else if (activePhenomenon === 'centripetal') {
        const s = simObjects.state, r = getInputValue('radius'), w = getInputValue('omega');
        if (isPlaying) s.angle += w * dt;
        const x = activeCategory === 'daily' ? r * Math.sin(s.angle) : r * Math.cos(s.angle);
        const z = activeCategory === 'daily' ? r * Math.cos(s.angle) : r * Math.sin(s.angle);
        simObjects.bob.position.set(x, 2, z);
        if (activeCategory === 'daily') {
            simObjects.bob.rotation.y = s.angle;
            simObjects.bob.rotation.z = -0.18;
        }
        simObjects.rod.geometry.setFromPoints([new THREE.Vector3(0, 2, 0), new THREE.Vector3(x, 2, z)]);
        if (isPlaying) appendTrailPoint(new THREE.Vector3(x, 2, z), 0x06b6d4);
        const F_centripetal = getInputValue('mass') * w * w * r;
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc dài</span><span class="text-cyan-400 font-bold">${(w * r).toFixed(2)} m/s</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Lực hướng tâm</span><span class="text-cyan-400 font-bold">${F_centripetal.toFixed(2)} N</span></div>
        `;

    } else if (activePhenomenon === 'refraction') {
        const n1 = getInputValue('n1'), n2 = getInputValue('n2'), angle = getInputValue('incAngle');
        const incidentAngle = angle * Math.PI / 180;
        const sinRefraction = n1 * Math.sin(incidentAngle) / n2;
        const totalInternalReflection = sinRefraction > 1;
        const refractionAngle = totalInternalReflection ? incidentAngle : Math.asin(sinRefraction);
        const entryPoint = new THREE.Vector3(0, 3, 0);
        const rayPoints = [
            new THREE.Vector3(-10, 3 + Math.tan(incidentAngle) * 4, 0),
            entryPoint,
            totalInternalReflection
                ? new THREE.Vector3(-10, 3 - Math.tan(incidentAngle) * 4, 0)
                : new THREE.Vector3(10, 3 - Math.tan(refractionAngle) * 4, 0)
        ];
        simObjects.rayLine.geometry.setFromPoints(rayPoints);
        if (activeCategory !== 'daily') {
            simObjects.prism.material.color.set(totalInternalReflection ? 0xfbbf24 : 0x38bdf8);
        }
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Góc tới</span><span class="text-cyan-400 font-bold">${angle.toFixed(1)}°</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">${totalInternalReflection ? 'Hiện tượng' : 'Góc khúc xạ'}</span><span class="text-cyan-400 font-bold">${totalInternalReflection ? 'Phản xạ toàn phần' : `${(refractionAngle * 180 / Math.PI).toFixed(1)}°`}</span></div>
        `;

    } else if (activePhenomenon === 'lorentz') {
        const s = simObjects.state, q = getInputValue('charge'), B = getInputValue('bField'), m = getInputValue('mass');
        if (isPlaying) {
            const bVec = new THREE.Vector3(0, B, 0);
            const force = new THREE.Vector3().crossVectors(s.vel, bVec).multiplyScalar(q);
            s.vel.add(force.divideScalar(m).multiplyScalar(dt));
            s.pos.add(s.vel.clone().multiplyScalar(dt));
            appendTrailPoint(s.pos, 0x00ffff);
        }
        simObjects.particle.position.copy(s.pos);
        metrics.innerHTML = `<div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Vận tốc hạt</span><span class="text-cyan-400 font-bold">${s.vel.length().toFixed(2)} m/s</span></div>`;

    } else if (activePhenomenon === 'brownian') {
        if (isPlaying) {
            simObjects.particles.forEach(p => {
                p.mesh.position.add(p.vel.clone().multiplyScalar(dt));
                if (Math.abs(p.mesh.position.x) > 10) p.vel.x *= -1;
                if (p.mesh.position.y < 0.5 || p.mesh.position.y > 12) p.vel.y *= -1;
                if (Math.abs(p.mesh.position.z) > 10) p.vel.z *= -1;
            });
        }
        metrics.innerHTML = `<div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Trạng thái</span><span class="text-cyan-400 font-bold">Chuyển động Va chạm Nhiệt</span></div>`;

    } else if (activePhenomenon === 'buoyancy') {
        const s = simObjects.state;
        const fluidDensity = getInputValue('fluidDensity');
        const objectDensity = getInputValue('objectDensity');
        const volume = activeCategory === 'daily' ? 12 : 27;
        const gravity = 9.8, waterSurface = 8;
        const blockHeight = activeCategory === 'daily' ? 1.6 : 3;

        if (isPlaying) {
            const submerged = Math.max(0, Math.min(1, (waterSurface - (s.y - blockHeight / 2)) / blockHeight));
            const acceleration = gravity * (fluidDensity * submerged / objectDensity - 1);
            s.v += acceleration * dt;
            if (submerged > 0) s.v *= Math.max(0, 1 - 0.8 * dt);
            s.y += s.v * dt;
            if (s.y < blockHeight / 2) {
                s.y = blockHeight / 2;
                s.v = 0;
            }
        }

        const submerged = Math.max(0, Math.min(1, (waterSurface - (s.y - blockHeight / 2)) / blockHeight));
        const buoyantForce = fluidDensity * gravity * volume * submerged;
        const weight = objectDensity * gravity * volume;
        simObjects.block.position.set(0, s.y, 0);
        updateChart(buoyantForce, weight);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Phần vật chìm</span><span class="text-cyan-400 font-bold">${(submerged * 100).toFixed(0)}%</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Lực đẩy / Trọng lượng</span><span class="text-cyan-400 font-bold">${buoyantForce.toFixed(0)} / ${weight.toFixed(0)} N</span></div>
            <div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Xu hướng</span><span class="text-cyan-400 font-bold">${objectDensity < fluidDensity ? 'Vật có xu hướng nổi' : objectDensity > fluidDensity ? 'Vật có xu hướng chìm' : 'Cân bằng khối lượng riêng'}</span></div>
        `;

    } else if (activePhenomenon === 'gravity') {
        const st = simObjects.state, G = getInputValue('gConst'), bodies = ['sun', 'p1', 'p2'];
        if (isPlaying) {
            bodies.forEach(b1Key => {
                bodies.forEach(b2Key => {
                    if (b1Key !== b2Key) {
                        const b1 = st[b1Key], b2 = st[b2Key];
                        const dir = new THREE.Vector3().subVectors(b2.pos, b1.pos);
                        const dist = Math.max(dir.length(), 2);
                        const force = dir.normalize().multiplyScalar((G * b1.mass * b2.mass) / (dist * dist));
                        b1.vel.add(force.divideScalar(b1.mass).multiplyScalar(dt));
                    }
                });
            });
            bodies.forEach(k => st[k].pos.add(st[k].vel.clone().multiplyScalar(dt)));
            appendTrailPoint(st.p1.pos, 0x10b981);
            appendTrailPoint(st.p2.pos, 0xa855f7);
        }
        simObjects.sun.position.copy(st.sun.pos);
        simObjects.p1.position.copy(st.p1.pos);
        simObjects.p2.position.copy(st.p2.pos);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Khoảng cách Sun - P1</span><span class="text-cyan-400 font-bold">${st.sun.pos.distanceTo(st.p1.pos).toFixed(2)} m</span></div>
        `;

    } else if (activePhenomenon === 'bohrAtom') {
        const s = simObjects.state, n = getInputValue('nOrbit'), z = getInputValue('zNum'), radiusInBohrUnits = n * n / z, r = radiusInBohrUnits * 3;
        if (isPlaying) s.angle += (4 / n) * dt;
        simObjects.electron.position.set(r * Math.cos(s.angle), 0, r * Math.sin(s.angle));
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Bán kính quỹ đạo</span><span class="text-cyan-400 font-bold">${radiusInBohrUnits.toFixed(2)} a₀</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Mức năng lượng</span><span class="text-cyan-400 font-bold">${(-13.6 * z * z / (n * n)).toFixed(2)} eV</span></div>
        `;
    }

    updateFormulaDisplay();
}

// --- ANIMATION LOOP ---
let lastTime = performance.now();
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1) * timeScale;
    lastTime = now;

    controls.update();
    updatePhysics(dt);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = initScene;
